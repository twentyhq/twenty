import { isFunction, isNonEmptyString } from '@sniptt/guards';

import { type ElementLike } from '@/polyfills/dom/types/ElementLike';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';

type DocumentWithGetElementById = ElementLike & {
  getElementById?: unknown;
};

export const installDocumentGetElementById = (
  documentTarget: DocumentWithGetElementById,
): void => {
  if (isFunction(documentTarget.getElementById)) {
    return;
  }

  documentTarget.getElementById = (elementId: string) => {
    if (!isNonEmptyString(elementId)) {
      return null;
    }

    for (const currentNode of iterateElementSubtree(documentTarget)) {
      if (
        isFunction(currentNode.getAttribute) &&
        currentNode.getAttribute('id') === elementId
      ) {
        return currentNode;
      }
    }

    return null;
  };
};
