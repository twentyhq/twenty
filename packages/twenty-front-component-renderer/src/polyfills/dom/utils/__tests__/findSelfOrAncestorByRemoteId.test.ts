import { remoteId } from '@remote-dom/core/elements';
import { Window } from '@remote-dom/polyfill';

import { findSelfOrAncestorByRemoteId } from '@/polyfills/dom/utils/findSelfOrAncestorByRemoteId';

const createRemoteTree = () => {
  const document = new Window().document as unknown as Document;
  const rootElement = document.createElement('div');
  const scrollContainer = document.createElement('div');
  const listItem = document.createElement('div');
  const label = document.createElement('span');

  scrollContainer.append(listItem);
  listItem.append(label);
  rootElement.append(scrollContainer);
  document.body.append(rootElement);

  return { document, rootElement, scrollContainer, listItem, label };
};

describe('findSelfOrAncestorByRemoteId', () => {
  it('should return the element itself when it carries the remote id', () => {
    const { rootElement, label } = createRemoteTree();

    expect(
      findSelfOrAncestorByRemoteId({
        element: label,
        remoteElementId: remoteId(label),
        rootElement,
      }),
    ).toBe(label);
  });

  it('should return the closest ancestor carrying the remote id', () => {
    const { rootElement, scrollContainer, label } = createRemoteTree();

    expect(
      findSelfOrAncestorByRemoteId({
        element: label,
        remoteElementId: remoteId(scrollContainer),
        rootElement,
      }),
    ).toBe(scrollContainer);
  });

  it('should stop at the root without matching the root itself', () => {
    const { rootElement, label } = createRemoteTree();

    expect(
      findSelfOrAncestorByRemoteId({
        element: label,
        remoteElementId: remoteId(rootElement),
        rootElement,
      }),
    ).toBeNull();
  });

  it('should not match an ancestor above the root', () => {
    const { document, rootElement, label } = createRemoteTree();

    expect(
      findSelfOrAncestorByRemoteId({
        element: label,
        remoteElementId: remoteId(document.body),
        rootElement,
      }),
    ).toBeNull();
  });

  it('should return null when no element in the chain carries the remote id', () => {
    const { rootElement, listItem } = createRemoteTree();

    expect(
      findSelfOrAncestorByRemoteId({
        element: listItem,
        remoteElementId: 'missing',
        rootElement,
      }),
    ).toBeNull();
  });

  it('should walk every ancestor when there is no root', () => {
    const { document, label } = createRemoteTree();

    expect(
      findSelfOrAncestorByRemoteId({
        element: label,
        remoteElementId: remoteId(document.body),
        rootElement: null,
      }),
    ).toBe(document.body);
  });
});
