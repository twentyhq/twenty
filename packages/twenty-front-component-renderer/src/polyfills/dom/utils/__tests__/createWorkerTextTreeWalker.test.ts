import { Window } from '@remote-dom/polyfill';

import { createWorkerTextTreeWalker } from '../createWorkerTextTreeWalker';

const createPolyfillDocument = (): Document =>
  new Window().document as unknown as Document;

describe('createWorkerTextTreeWalker', () => {
  it('should traverse nested text in DOM order without leaving the root', () => {
    const document = createPolyfillDocument();
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

    const walker = createWorkerTextTreeWalker(root);

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
    const document = createPolyfillDocument();
    const root = document.createElement('div');
    const firstText = document.createTextNode('First');
    const removedText = document.createTextNode('Removed');
    const insertedText = document.createTextNode('Inserted');

    root.append(firstText, removedText);

    const walker = createWorkerTextTreeWalker(root);

    expect(walker.nextNode()).toBe(firstText);

    removedText.remove();
    root.append(insertedText);

    expect(walker.nextNode()).toBe(insertedText);
    expect(walker.nextNode()).toBeNull();
  });

  it('should resume from an explicitly assigned current node', () => {
    const document = createPolyfillDocument();
    const root = document.createElement('div');
    const nested = document.createElement('span');
    const nestedText = document.createTextNode('Nested');

    nested.append(nestedText);
    root.append(document.createTextNode('First'), nested);

    const walker = createWorkerTextTreeWalker(root);

    walker.currentNode = nested;

    expect(walker.nextNode()).toBe(nestedText);
  });

  it('should not include a text root among its descendants', () => {
    const document = createPolyfillDocument();
    const root = document.createTextNode('Root');
    const walker = createWorkerTextTreeWalker(root);

    expect(walker.nextNode()).toBeNull();
    expect(walker.currentNode).toBe(root);
  });
});
