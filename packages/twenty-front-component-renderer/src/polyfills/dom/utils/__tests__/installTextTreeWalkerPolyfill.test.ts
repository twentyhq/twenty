import { Window } from '@remote-dom/polyfill';

import { installTextTreeWalkerPolyfill } from '../installTextTreeWalkerPolyfill';

const createPolyfillDocument = () => {
  const polyfillWindow = new Window();
  const globalScope: Record<string, unknown> = { window: polyfillWindow };

  installTextTreeWalkerPolyfill({ globalScope });

  return {
    document: polyfillWindow.document as unknown as Document,
    nodeFilter: globalScope.NodeFilter as typeof NodeFilter,
  };
};

describe('installTextTreeWalkerPolyfill', () => {
  it('should create a worker text walker for a SHOW_TEXT request', () => {
    const { document, nodeFilter } = createPolyfillDocument();
    const root = document.createElement('div');
    const text = document.createTextNode('Text');

    root.append(text);

    const walker = document.createTreeWalker(root, nodeFilter.SHOW_TEXT);

    expect(walker.root).toBe(root);
    expect(walker.whatToShow).toBe(nodeFilter.SHOW_TEXT);
    expect(walker.nextNode()).toBe(text);
  });

  it('should expose the standard NodeFilter constants', () => {
    const { nodeFilter } = createPolyfillDocument();

    expect(Object.keys(nodeFilter)).toHaveLength(16);

    for (const [constantName, constantValue] of Object.entries(nodeFilter)) {
      expect(constantValue).toBe(Reflect.get(NodeFilter, constantName));
    }
  });

  it('should reject unsupported node masks and callback filters', () => {
    const { document, nodeFilter } = createPolyfillDocument();
    const root = document.createElement('div');

    expect(() => document.createTreeWalker(root, NodeFilter.SHOW_ALL)).toThrow(
      'Worker TreeWalker supports SHOW_TEXT without a callback filter',
    );
    expect(() =>
      document.createTreeWalker(
        root,
        nodeFilter.SHOW_TEXT,
        () => NodeFilter.FILTER_ACCEPT,
      ),
    ).toThrow('Worker TreeWalker supports SHOW_TEXT without a callback filter');
  });

  it('should preserve an existing TreeWalker implementation', () => {
    const createTreeWalker = jest.fn();
    const globalScope = {
      document: { createTreeWalker },
      NodeFilter,
    };

    installTextTreeWalkerPolyfill({ globalScope });

    expect(globalScope.document.createTreeWalker).toBe(createTreeWalker);
    expect(globalScope.NodeFilter).toBe(NodeFilter);
  });
});
