import { remoteId } from '@remote-dom/core/elements';
import { isObject } from '@sniptt/guards';

import { type NodeLike } from '@/polyfills/dom/types/NodeLike';

export const findAncestorByRemoteId = ({
  node,
  remoteElementId,
}: {
  node: NodeLike;
  remoteElementId: string;
}): object | null => {
  let ancestor = node.parentNode;

  while (isObject(ancestor)) {
    if (remoteId(ancestor as Node) === remoteElementId) {
      return ancestor;
    }

    ancestor = (ancestor as NodeLike).parentNode;
  }

  return null;
};
