import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

type NodeWithParent = {
  parentNode?: unknown;
};

export const findRemoteElementIdContainingNode = ({
  node,
  remoteElementIdByRegisteredNode,
}: {
  node: unknown;
  remoteElementIdByRegisteredNode: WeakMap<object, string>;
}): string | undefined => {
  let currentNode: unknown = node;

  while (isObject(currentNode)) {
    const remoteElementId = remoteElementIdByRegisteredNode.get(currentNode);

    if (isDefined(remoteElementId)) {
      return remoteElementId;
    }

    currentNode = (currentNode as NodeWithParent).parentNode;
  }

  return undefined;
};
