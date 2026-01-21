import { ThreadWebWorker } from '@quilted/threads';
import type {
  RemoteConnection,
  RemoteRootElement,
} from '@remote-dom/core/elements';
import '@remote-dom/core/polyfill';

type SandboxAPI = {
  render: (connection: RemoteConnection, sourceCode: string) => Promise<void>;
};

let root: RemoteRootElement | null = null;

const originalCreateElement = document.createElement.bind(document);
const originalCreateElementNS = document.createElementNS?.bind(document);

const createRemoteElementForTag = (tagName: string) => {
  if (tagName.includes('-')) {
    return originalCreateElement(tagName);
  }

  const element = originalCreateElement('remote-element');
  element.setAttribute('type', tagName);

  return element;
};

document.createElement = ((tagName: string) => {
  return createRemoteElementForTag(tagName);
}) as typeof document.createElement;

if (originalCreateElementNS !== undefined) {
  document.createElementNS = ((namespace: string, tagName: string) => {
    if (namespace !== '') {
      return originalCreateElementNS(namespace, tagName);
    }

    return createRemoteElementForTag(tagName);
  }) as typeof document.createElementNS;
}

const ensureRoot = async () => {
  if (root !== null) {
    return root;
  }

  const { RemoteRootElement } = await import('@remote-dom/core/elements');
  const rootTagName = 'remote-root';

  if (!customElements.get(rootTagName)) {
    customElements.define(rootTagName, RemoteRootElement);
  }

  root = document.createElement(rootTagName) as RemoteRootElement;
  root.setAttribute('data-front-component-root', 'true');
  document.body.append(root);

  return root;
};

const executeFrontComponent = (sourceCode: string, rootElement: Element) => {
  // Execute within the worker scope so `document` and polyfills are available.
  const run = new Function('root', sourceCode) as (root: Element) => void;
  run(rootElement);
};

ThreadWebWorker.self.export<SandboxAPI>({
  render: async (connection: RemoteConnection, sourceCode: string) => {
    const rootElement = await ensureRoot();

    rootElement.textContent = '';
    executeFrontComponent(sourceCode, rootElement);
    rootElement.connect(connection);
  },
});
