import { Window } from '@remote-dom/polyfill';

import { installNodeContainsPolyfill } from '../installNodeContainsPolyfill';

const createPolyfillDocument = (): Document => {
  const polyfillWindow = new Window();

  installNodeContainsPolyfill(polyfillWindow.Node.prototype);

  return polyfillWindow.document as unknown as Document;
};

describe('installNodeContainsPolyfill', () => {
  it('should return true for the node itself', () => {
    const document = createPolyfillDocument();
    const element = document.createElement('div');

    expect(element.contains(element)).toBe(true);
  });

  it('should return true for a direct child', () => {
    const document = createPolyfillDocument();
    const parent = document.createElement('div');
    const child = document.createElement('span');

    parent.append(child);

    expect(parent.contains(child)).toBe(true);
  });

  it('should return true for an indirect descendant', () => {
    const document = createPolyfillDocument();
    const ancestor = document.createElement('div');
    const intermediate = document.createElement('section');
    const descendant = document.createElement('span');

    ancestor.append(intermediate);
    intermediate.append(descendant);

    expect(ancestor.contains(descendant)).toBe(true);
  });

  it('should return true for a text node nested in the subtree', () => {
    const document = createPolyfillDocument();
    const ancestor = document.createElement('div');
    const paragraph = document.createElement('p');
    const text = document.createTextNode('hello');

    ancestor.append(paragraph);
    paragraph.append(text);

    expect(ancestor.contains(text)).toBe(true);
  });

  it('should return false for an ancestor', () => {
    const document = createPolyfillDocument();
    const parent = document.createElement('div');
    const child = document.createElement('span');

    parent.append(child);

    expect(child.contains(parent)).toBe(false);
  });

  it('should return false for a sibling subtree', () => {
    const document = createPolyfillDocument();
    const root = document.createElement('div');
    const left = document.createElement('div');
    const right = document.createElement('div');
    const rightChild = document.createElement('span');

    root.append(left, right);
    right.append(rightChild);

    expect(left.contains(rightChild)).toBe(false);
  });

  it('should return false for a detached node', () => {
    const document = createPolyfillDocument();

    expect(
      document.createElement('div').contains(document.createElement('span')),
    ).toBe(false);
  });

  it('should return false for nullish and non-node arguments', () => {
    const document = createPolyfillDocument();
    const element = document.createElement('div');

    expect(element.contains(null)).toBe(false);
    expect(element.contains(undefined as unknown as Node)).toBe(false);
    expect(element.contains({} as Node)).toBe(false);
  });
});
