import { Window } from '@remote-dom/polyfill';

import { installNodeContains } from '@/polyfills/dom/utils/installNodeContains';

const createDocument = () => {
  const polyfillWindow = new Window();
  installNodeContains(polyfillWindow.Node.prototype);

  return polyfillWindow.document as unknown as Document;
};

describe('installNodeContains', () => {
  it('finds deep descendants and the node itself', () => {
    const document = createDocument();
    const ancestor = document.createElement('div');
    const parent = document.createElement('section');
    const descendant = document.createElement('span');

    document.body.appendChild(ancestor);
    ancestor.appendChild(parent);
    parent.appendChild(descendant);

    expect(ancestor.contains(descendant)).toBe(true);
    expect(document.contains(descendant)).toBe(true);
    expect(descendant.contains(descendant)).toBe(true);
  });

  it('returns false for sibling branches, ancestors, and null', () => {
    const document = createDocument();
    const trigger = document.createElement('span');
    const popup = document.createElement('div');

    document.body.appendChild(trigger);
    document.body.appendChild(popup);

    expect(popup.contains(trigger)).toBe(false);
    expect(trigger.contains(popup)).toBe(false);
    expect(trigger.contains(document.body)).toBe(false);
    expect(popup.contains(null)).toBe(false);
  });

  it('supports detached subtrees and text nodes', () => {
    const document = createDocument();
    const detachedRoot = document.createElement('div');
    const text = document.createTextNode('Tooltip content');
    const unrelated = document.createElement('span');

    detachedRoot.appendChild(text);

    expect(detachedRoot.contains(text)).toBe(true);
    expect(document.contains(detachedRoot)).toBe(false);
    expect(detachedRoot.contains(unrelated)).toBe(false);
  });
});
