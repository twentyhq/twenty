import { Window } from '@remote-dom/polyfill';

import { installGetRootNodePolyfill } from '../installGetRootNodePolyfill';

const createPolyfillDocument = (): Document => {
  const polyfillWindow = new Window();

  installGetRootNodePolyfill(polyfillWindow.Node.prototype);

  return polyfillWindow.document as unknown as Document;
};

describe('installGetRootNodePolyfill', () => {
  it('should return the document for a connected node', () => {
    const document = createPolyfillDocument();
    const element = document.createElement('div');
    const nested = document.createElement('span');

    element.append(nested);
    document.body.append(element);

    expect(nested.getRootNode()).toBe(document);
  });

  it('should return the topmost detached ancestor for a detached subtree', () => {
    const document = createPolyfillDocument();
    const root = document.createElement('div');
    const nested = document.createElement('span');

    root.append(nested);

    expect(nested.getRootNode()).toBe(root);
  });

  it('should return the node itself when it has no parent', () => {
    const document = createPolyfillDocument();
    const element = document.createElement('div');

    expect(element.getRootNode()).toBe(element);
  });
});
