import { type NodeLike } from '@/polyfills/dom/types/NodeLike';
import { findSelfOrAncestorByRemoteId } from '@/polyfills/dom/utils/findSelfOrAncestorByRemoteId';
import { isElementNode } from '@/polyfills/dom/utils/isElementNode';

export const findAncestorByRemoteId = ({
  node,
  remoteElementId,
}: {
  node: NodeLike;
  remoteElementId: string;
}): Element | null => {
  const { parentNode } = node;

  if (!isElementNode(parentNode)) {
    return null;
  }

  return findSelfOrAncestorByRemoteId({
    element: parentNode,
    remoteElementId,
    rootElement: null,
  });
};
