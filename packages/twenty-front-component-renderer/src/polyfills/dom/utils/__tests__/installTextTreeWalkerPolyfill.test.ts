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
  it('should traverse nested text in DOM order without leaving the root', () => {
    const { document, nodeFilter } = createPolyfillDocument();
    const root = document.createElement('div');
    const nested = document.createElement('span');
    const deeplyNested = document.createElement('strong');
    const firstText = document.createTextNode('No ');
    const nestedText = document.createTextNode('matching ');
    const lastText = document.createTextNode('items');
    const emptyText = document.createTextNode('');

    deeplyNested.append(lastText);
    nested.append(nestedText, deeplyNested);
    root.append(
      firstText,
      document.createComment('ignored'),
      nested,
      emptyText,
    );
    document.body.append(root, document.createTextNode('outside'));

    const walker = document.createTreeWalker(root, nodeFilter.SHOW_TEXT);

    expect(walker.root).toBe(root);
    expect(walker.currentNode).toBe(root);
    expect(walker.nextNode()).toBe(firstText);
    expect(walker.currentNode).toBe(firstText);
    expect(walker.nextNode()).toBe(nestedText);
    expect(walker.nextNode()).toBe(lastText);
    expect(walker.nextNode()).toBe(emptyText);
    expect(walker.nextNode()).toBeNull();
    expect(walker.currentNode).toBe(emptyText);
    expect(walker.nextNode()).toBeNull();
  });

  it('should reflect inserted and removed text before advancing', () => {
    const { document, nodeFilter } = createPolyfillDocument();
    const root = document.createElement('div');
    const firstText = document.createTextNode('First');
    const removedText = document.createTextNode('Removed');
    const insertedText = document.createTextNode('Inserted');

    root.append(firstText, removedText);

    const walker = document.createTreeWalker(root, nodeFilter.SHOW_TEXT);

    expect(walker.nextNode()).toBe(firstText);

    removedText.remove();
    root.append(insertedText);

    expect(walker.nextNode()).toBe(insertedText);
    expect(walker.nextNode()).toBeNull();
  });

  it('should resume from an explicitly assigned current node', () => {
    const { document, nodeFilter } = createPolyfillDocument();
    const root = document.createElement('div');
    const nested = document.createElement('span');
    const nestedText = document.createTextNode('Nested');

    nested.append(nestedText);
    root.append(document.createTextNode('First'), nested);

    const walker = document.createTreeWalker(root, nodeFilter.SHOW_TEXT);

    walker.currentNode = nested;

    expect(walker.nextNode()).toBe(nestedText);
  });

  it('should not include a text root among its descendants', () => {
    const { document, nodeFilter } = createPolyfillDocument();
    const root = document.createTextNode('Root');
    const walker = document.createTreeWalker(root, nodeFilter.SHOW_TEXT);

    expect(walker.nextNode()).toBeNull();
    expect(walker.currentNode).toBe(root);
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
