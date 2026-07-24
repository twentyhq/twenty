import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { MAX_REMOTE_ROOT_ANCESTOR_WALK_DEPTH } from '@/polyfills/geometry/constants/MaxRemoteRootAncestorWalkDepth';

type NodeLike = { parentNode?: unknown };

export const isElementUnderRemoteRoot = (
  element: object,
  rootElement: object | null,
): boolean => {
  if (!isDefined(rootElement)) {
    return false;
  }

  let currentNode: object | null = element;
  let walkedDepth = 0;

  while (isDefined(currentNode)) {
    if (currentNode === rootElement) {
      return true;
    }

    if (walkedDepth >= MAX_REMOTE_ROOT_ANCESTOR_WALK_DEPTH) {
      break;
    }

    const parentNode: unknown = (currentNode as NodeLike).parentNode;

    currentNode = isObject(parentNode) ? parentNode : null;

    walkedDepth += 1;
  }

  return false;
};
