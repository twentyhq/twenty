import { remoteId } from '@remote-dom/core/elements';

import { type NodeLike } from '@/polyfills/dom/types/NodeLike';
import { isElementNode } from '@/polyfills/dom/utils/isElementNode';

export const findAncestorByRemoteId = ({
  node,
  remoteElementId,
}: {
  node: NodeLike;
  remoteElementId: string;
}): Element | null => {
  let ancestor: unknown = node.parentNode;

  while (isElementNode(ancestor)) {
    if (remoteId(ancestor) === remoteElementId) {
      return ancestor;
    }

    ancestor = ancestor.parentNode;
  }

  return null;
};
