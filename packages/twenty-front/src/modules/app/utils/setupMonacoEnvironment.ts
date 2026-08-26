import { type Environment } from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';
import CssWorker from 'monaco-editor/esm/vs/language/css/css.worker.js?worker';
import HtmlWorker from 'monaco-editor/esm/vs/language/html/html.worker.js?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker';
import TypeScriptWorker from 'monaco-editor/esm/vs/language/typescript/ts.worker.js?worker';
import GraphqlWorker from 'monaco-graphql/esm/graphql.worker.js?worker';

// Monaco resolves every language worker through this single global, shared by
// all editors on the page (GraphiQL's and CodeEditor's alike), so it has to be
// set up once for the whole app rather than per feature.
//
// Every label Monaco can ask for must be mapped: an unmapped label silently
// falls back to the generic editor worker, which carries no language service.
// Requests to it then reject with "Missing requestHandler or method: <method>"
// (`resetSchema`, `findDocumentColors`, `getCodeFixesAtPosition`, ...) and the
// language features go quietly dead.
const monacoEnvironment: Environment = {
  getWorker: (_workerId, label) => {
    switch (label) {
      case 'json':
        return new JsonWorker();
      case 'css':
      case 'scss':
      case 'less':
        return new CssWorker();
      case 'html':
      case 'handlebars':
      case 'razor':
        return new HtmlWorker();
      case 'typescript':
      case 'javascript':
        return new TypeScriptWorker();
      case 'graphql':
        return new GraphqlWorker();
      default:
        return new EditorWorker();
    }
  },
};

(
  globalThis as unknown as { MonacoEnvironment?: Environment }
).MonacoEnvironment = monacoEnvironment;
