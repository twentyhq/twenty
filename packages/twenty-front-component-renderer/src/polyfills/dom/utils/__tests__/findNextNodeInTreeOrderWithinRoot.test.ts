import { Window } from '@remote-dom/polyfill';

import { findNextNodeInTreeOrderWithinRoot } from '../findNextNodeInTreeOrderWithinRoot';

const createPolyfillDocument = (): Document =>
  new Window().document as unknown as Document;

describe('findNextNodeInTreeOrderWithinRoot', () => {
  it('should return the first child before any sibling', () => {
    const document = createPolyfillDocument();
    const root = document.createElement('div');
    const parent = document.createElement('span');
    const firstChild = document.createTextNode('First');

    parent.append(firstChild);
    root.append(parent, document.createTextNode('Sibling'));

    expect(findNextNodeInTreeOrderWithinRoot({ node: parent, root })).toBe(
      firstChild,
    );
  });

  it('should return the next sibling of a node without children', () => {
    const document = createPolyfillDocument();
    const root = document.createElement('div');
    const firstText = document.createTextNode('First');
    const secondText = document.createTextNode('Second');

    root.append(firstText, secondText);

    expect(findNextNodeInTreeOrderWithinRoot({ node: firstText, root })).toBe(
      secondText,
    );
  });

  it('should climb to the next sibling of the closest ancestor that has one', () => {
    const document = createPolyfillDocument();
    const root = document.createElement('div');
    const outer = document.createElement('span');
    const inner = document.createElement('strong');
    const deepestText = document.createTextNode('Deepest');
    const textAfterOuter = document.createTextNode('After');

    inner.append(deepestText);
    outer.append(inner);
    root.append(outer, textAfterOuter);

    expect(findNextNodeInTreeOrderWithinRoot({ node: deepestText, root })).toBe(
      textAfterOuter,
    );
  });

  it('should return null after the last descendant instead of leaving the root', () => {
    const document = createPolyfillDocument();
    const root = document.createElement('div');
    const lastText = document.createTextNode('Last');

    root.append(lastText);
    document.body.append(root, document.createTextNode('Outside'));

    expect(
      findNextNodeInTreeOrderWithinRoot({ node: lastText, root }),
    ).toBeNull();
  });

  it('should return null for a root without children', () => {
    const document = createPolyfillDocument();
    const root = document.createElement('div');

    document.body.append(root, document.createTextNode('Outside'));

    expect(findNextNodeInTreeOrderWithinRoot({ node: root, root })).toBeNull();
  });
});
