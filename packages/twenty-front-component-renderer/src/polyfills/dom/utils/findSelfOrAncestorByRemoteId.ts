import { remoteId } from '@remote-dom/core/elements';

import { isElementNode } from '@/polyfills/dom/utils/isElementNode';

export const findSelfOrAncestorByRemoteId = ({
  element,
  remoteElementId,
  rootElement,
}: {
  element: object;
  remoteElementId: string;
  rootElement: object | null;
}): Element | null => {
  let currentNode: object | null = element;

  while (isElementNode(currentNode) && currentNode !== rootElement) {
    if (remoteId(currentNode) === remoteElementId) {
      return currentNode;
    }

    currentNode = currentNode.parentNode;
  }

  return null;
};
