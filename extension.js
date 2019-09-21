const vscode = require('vscode');

const EXTENSION_COMMAND = 'extension.log';
const COMMON_WHITESPACES_CODES = [
	9, // tab 
	32, // space
];
const COMPLETION_STRING = 'l';
const COMPLETION_INSERT_TEXT = 'log';

/**
 * 
 * @param {string} str 
 * @returns {Array<string>}
 */
function splitLineToWhitespacesAndContent(str) {
	const idx = str.split('').findIndex(x => !COMMON_WHITESPACES_CODES.includes(x.charCodeAt(0)));

	return [
		str.substring(0, idx),
		str.substring(idx)
	];
}

class CustomCompletionItem extends vscode.CompletionItem {
	constructor() {
		super(COMPLETION_STRING);

		this.insertText = COMPLETION_INSERT_TEXT;
		this.kind = vscode.CompletionItemKind.Constant;
		this.preselect = true;
	}
}

class GoCompletionItemProvider {
	provideCompletionItems() {
		return [new CustomCompletionItem()];
	}
}

function activate(context) {
	vscode.languages.registerCompletionItemProvider(
		{
			scheme: 'file',
			pattern: '**/*.{ts,js,jsx,mjs}'
		},
		new GoCompletionItemProvider(),
		'.',
		'\"'
	)

	vscode.workspace.onDidChangeTextDocument(task => {
		if (task.contentChanges[0].text === COMPLETION_INSERT_TEXT)
			vscode.commands.executeCommand(EXTENSION_COMMAND, true);
	});

	let disposable = vscode.commands.registerTextEditorCommand(EXTENSION_COMMAND, function (te, tee, replaceCommandInCompletionMode) {
		try {
			const { line } = vscode.window.activeTextEditor.selection.active;

			const start = new vscode.Position(line, 0);

			const { text } = vscode.window.activeTextEditor.document.lineAt(line);

			let [whitespaces, mainContent] = splitLineToWhitespacesAndContent(text);

			if (replaceCommandInCompletionMode)
				mainContent = mainContent.replace(`.${COMPLETION_INSERT_TEXT}`, '');

			const clText = `${whitespaces}console.log(${mainContent});`;

			const end = new vscode.Position(line, clText.length);
			const range = new vscode.Range(start, end);

			vscode.window.activeTextEditor.edit(edit => {
				edit.replace(range, clText);
			});
		}
		catch (e) {
			console.log(e);
		}
	});

	context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() { }

module.exports = {
	activate,
	deactivate
}
