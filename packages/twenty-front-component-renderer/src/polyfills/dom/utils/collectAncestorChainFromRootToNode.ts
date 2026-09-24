import { isObject } from '@sniptt/guards';

import { type NodeLike } from '@/polyfills/dom/types/NodeLike';

export const collectAncestorChainFromRootToNode = (node: unknown): object[] => {
  const ancestorChain: object[] = [];
  let currentNode: unknown = node;

  while (isObject(currentNode)) {
    ancestorChain.push(currentNode);
    currentNode = (currentNode as NodeLike).parentNode;
  }

  return ancestorChain.reverse();
};
