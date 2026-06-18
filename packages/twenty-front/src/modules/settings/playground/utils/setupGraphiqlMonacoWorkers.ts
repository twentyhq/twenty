import { type Environment } from 'monaco-editor';
import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker.js?worker';
import JsonWorker from 'monaco-editor/esm/vs/language/json/json.worker.js?worker';
import GraphqlWorker from 'monaco-graphql/esm/graphql.worker.js?worker';

// GraphiQL 5's Monaco editors need a worker factory; without it Monaco throws "Cannot read properties of undefined (reading 'toUrl')".
const monacoEnvironment: Environment = {
  getWorker: (_workerId, label) => {
    switch (label) {
      case 'json':
        return new JsonWorker();
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
