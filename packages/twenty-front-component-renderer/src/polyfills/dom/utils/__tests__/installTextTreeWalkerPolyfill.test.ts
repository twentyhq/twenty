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

  it.each([
    'FILTER_ACCEPT',
    'FILTER_REJECT',
    'FILTER_SKIP',
    'SHOW_ALL',
    'SHOW_ELEMENT',
    'SHOW_ATTRIBUTE',
    'SHOW_TEXT',
    'SHOW_CDATA_SECTION',
    'SHOW_ENTITY_REFERENCE',
    'SHOW_ENTITY',
    'SHOW_PROCESSING_INSTRUCTION',
    'SHOW_COMMENT',
    'SHOW_DOCUMENT',
    'SHOW_DOCUMENT_TYPE',
    'SHOW_DOCUMENT_FRAGMENT',
    'SHOW_NOTATION',
  ] as const)(
    'should expose the standard NodeFilter.%s constant',
    (constantName) => {
      const { nodeFilter } = createPolyfillDocument();

      expect(nodeFilter[constantName]).toBe(NodeFilter[constantName]);
    },
  );

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
