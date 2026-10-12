import { remoteId } from '@remote-dom/core/elements';
import { isObject } from '@sniptt/guards';

export const findSelfOrAncestorByRemoteId = ({
  element,
  remoteElementId,
  rootElement,
}: {
  element: object;
  remoteElementId: string;
  rootElement: object | null;
}): object | null => {
  let currentNode: unknown = element;

  while (isObject(currentNode) && currentNode !== rootElement) {
    if (remoteId(currentNode as Node) === remoteElementId) {
      return currentNode;
    }

    currentNode = Reflect.get(currentNode, 'parentNode');
  }

  return null;
};
