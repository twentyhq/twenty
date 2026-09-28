import { isObject } from '@sniptt/guards';

import { type NodeLike } from '@/polyfills/dom/types/NodeLike';

export const isAncestorOrSelfOfNode = (
  candidateAncestor: object,
  node: unknown,
): boolean => {
  let currentNode: unknown = node;

  while (isObject(currentNode)) {
    if (currentNode === candidateAncestor) {
      return true;
    }

    currentNode = (currentNode as NodeLike).parentNode;
  }

  return false;
};
