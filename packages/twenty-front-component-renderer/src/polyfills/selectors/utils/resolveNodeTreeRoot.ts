import { isObject } from '@sniptt/guards';

import { type SelectorElementLike } from '@/polyfills/selectors/types/SelectorElementLike';

export const resolveNodeTreeRoot = (
  node: SelectorElementLike,
): SelectorElementLike => {
  let currentNode = node;

  while (isObject(currentNode.parentNode)) {
    currentNode = currentNode.parentNode as SelectorElementLike;
  }

  return currentNode;
};
