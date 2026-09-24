import { Window } from '@remote-dom/polyfill';

import { installCompareDocumentPositionPolyfill } from '../installCompareDocumentPositionPolyfill';

type PolyfillNodeConstructor = typeof Node;

const createPolyfillDocument = (): {
  document: Document;
  nodeConstructor: PolyfillNodeConstructor;
} => {
  const polyfillWindow = new Window();
  const nodeConstructor =
    polyfillWindow.Node as unknown as PolyfillNodeConstructor;

  installCompareDocumentPositionPolyfill({
    nodeConstructor,
    nodePrototype: nodeConstructor.prototype,
  });

  return {
    document: polyfillWindow.document as unknown as Document,
    nodeConstructor,
  };
};

describe('installCompareDocumentPositionPolyfill', () => {
  it('should expose the DOCUMENT_POSITION constants on the constructor and on nodes', () => {
    const { document, nodeConstructor } = createPolyfillDocument();
    const element = document.createElement('div');

    expect(nodeConstructor.DOCUMENT_POSITION_DISCONNECTED).toBe(1);
    expect(nodeConstructor.DOCUMENT_POSITION_PRECEDING).toBe(2);
    expect(nodeConstructor.DOCUMENT_POSITION_FOLLOWING).toBe(4);
    expect(nodeConstructor.DOCUMENT_POSITION_CONTAINS).toBe(8);
    expect(nodeConstructor.DOCUMENT_POSITION_CONTAINED_BY).toBe(16);
    expect(nodeConstructor.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC).toBe(32);
    expect(element.DOCUMENT_POSITION_FOLLOWING).toBe(4);
  });

  it('should return 0 for the same node', () => {
    const { document } = createPolyfillDocument();
    const element = document.createElement('div');

    expect(element.compareDocumentPosition(element)).toBe(0);
  });

  it('should throw a TypeError when the argument is not a node', () => {
    const { document } = createPolyfillDocument();
    const element = document.createElement('div');

    expect(() =>
      element.compareDocumentPosition(null as unknown as Node),
    ).toThrow(TypeError);
    expect(() => element.compareDocumentPosition({} as Node)).toThrow(
      TypeError,
    );
    expect(() =>
      element.compareDocumentPosition({ parentNode: null } as unknown as Node),
    ).toThrow(TypeError);
  });

  it('should keep disconnected ordering stable and reverse it when arguments reverse', () => {
    const { document, nodeConstructor } = createPolyfillDocument();
    const first = document.createElement('div');
    const second = document.createElement('div');

    const firstComparison = first.compareDocumentPosition(second);
    const reverseComparison = second.compareDocumentPosition(first);
    const disconnectedFlags =
      nodeConstructor.DOCUMENT_POSITION_DISCONNECTED |
      nodeConstructor.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC;

    expect(firstComparison & disconnectedFlags).toBe(disconnectedFlags);
    expect(reverseComparison & disconnectedFlags).toBe(disconnectedFlags);
    expect(
      Boolean(firstComparison & nodeConstructor.DOCUMENT_POSITION_PRECEDING),
    ).toBe(
      Boolean(reverseComparison & nodeConstructor.DOCUMENT_POSITION_FOLLOWING),
    );
    expect(first.compareDocumentPosition(second)).toBe(firstComparison);
  });

  it('should order disconnected trees consistently regardless of which descendants are compared', () => {
    const { document, nodeConstructor } = createPolyfillDocument();
    const roots = ['div', 'section', 'p'].map((tag) =>
      document.createElement(tag),
    );
    const children = roots.map((root) => {
      const child = document.createElement('span');
      root.append(child);
      return child;
    });
    const [first, second, third] = roots;
    const direction = first.compareDocumentPosition(second);

    expect(children[0].compareDocumentPosition(children[1])).toBe(direction);
    expect(children[1].compareDocumentPosition(third)).toBe(
      nodeConstructor.DOCUMENT_POSITION_DISCONNECTED |
        nodeConstructor.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC |
        nodeConstructor.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(first.compareDocumentPosition(third)).toBe(
      second.compareDocumentPosition(third),
    );
  });

  it('should report an ancestor as containing and preceding', () => {
    const { document, nodeConstructor } = createPolyfillDocument();
    const ancestor = document.createElement('div');
    const intermediate = document.createElement('section');
    const descendant = document.createElement('span');

    ancestor.append(intermediate);
    intermediate.append(descendant);

    expect(descendant.compareDocumentPosition(ancestor)).toBe(
      nodeConstructor.DOCUMENT_POSITION_CONTAINS |
        nodeConstructor.DOCUMENT_POSITION_PRECEDING,
    );
  });

  it('should report a descendant as contained by and following', () => {
    const { document, nodeConstructor } = createPolyfillDocument();
    const ancestor = document.createElement('div');
    const intermediate = document.createElement('section');
    const descendant = document.createElement('span');

    ancestor.append(intermediate);
    intermediate.append(descendant);

    expect(ancestor.compareDocumentPosition(descendant)).toBe(
      nodeConstructor.DOCUMENT_POSITION_CONTAINED_BY |
        nodeConstructor.DOCUMENT_POSITION_FOLLOWING,
    );
  });

  it('should order siblings and cousins by document order', () => {
    const { document, nodeConstructor } = createPolyfillDocument();
    const root = document.createElement('div');
    const firstBranch = document.createElement('section');
    const secondBranch = document.createElement('section');
    const firstLeaf = document.createElement('span');
    const secondLeaf = document.createElement('span');

    root.append(firstBranch, secondBranch);
    firstBranch.append(firstLeaf);
    secondBranch.append(secondLeaf);

    expect(firstBranch.compareDocumentPosition(secondBranch)).toBe(
      nodeConstructor.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(secondBranch.compareDocumentPosition(firstBranch)).toBe(
      nodeConstructor.DOCUMENT_POSITION_PRECEDING,
    );
    expect(firstLeaf.compareDocumentPosition(secondLeaf)).toBe(
      nodeConstructor.DOCUMENT_POSITION_FOLLOWING,
    );
    expect(secondLeaf.compareDocumentPosition(firstBranch)).toBe(
      nodeConstructor.DOCUMENT_POSITION_PRECEDING,
    );
  });

  it('should sort elements into document order with the Base UI comparator', () => {
    const { document, nodeConstructor } = createPolyfillDocument();
    const list = document.createElement('div');
    const tabs = ['first', 'second', 'third'].map((label) => {
      const tab = document.createElement('button');
      tab.setAttribute('data-label', label);
      list.append(tab);

      return tab;
    });
    document.body.append(list);

    const sorted = [tabs[2], tabs[0], tabs[1]].sort((first, second) =>
      first.compareDocumentPosition(second) &
      nodeConstructor.DOCUMENT_POSITION_FOLLOWING
        ? -1
        : 1,
    );

    expect(sorted.map((tab) => tab.getAttribute('data-label'))).toEqual([
      'first',
      'second',
      'third',
    ]);
  });
});
