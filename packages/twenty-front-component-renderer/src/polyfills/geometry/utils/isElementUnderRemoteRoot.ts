import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type NodeLike = { parentNode?: unknown };

export const isElementUnderRemoteRoot = (
  element: object,
  rootElement: object | null,
): boolean => {
  if (!isDefined(rootElement)) {
    return false;
  }

  let currentNode: object | null = element;

  while (isDefined(currentNode)) {
    if (currentNode === rootElement) {
      return true;
    }

    const parentNode: unknown = (currentNode as NodeLike).parentNode;

    currentNode = isObject(parentNode) ? parentNode : null;
  }

  return false;
};
