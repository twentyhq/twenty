import { remoteId } from '@remote-dom/core/elements';

import { NODE_TYPE_BY_NAME } from '@/polyfills/dom/constants/NodeTypeByName';
import { type ElementLike } from '@/polyfills/dom/types/ElementLike';
import { iterateElementSubtree } from '@/polyfills/dom/utils/iterateElementSubtree';

type NodeWithNodeType = ElementLike & {
  nodeType?: number;
};

export const findElementByRemoteId = ({
  rootNode,
  remoteElementId,
}: {
  rootNode: ElementLike;
  remoteElementId: string;
}): ElementLike | null => {
  for (const node of iterateElementSubtree(rootNode)) {
    if (
      (node as NodeWithNodeType).nodeType === NODE_TYPE_BY_NAME.ELEMENT &&
      remoteId(node as Node) === remoteElementId
    ) {
      return node;
    }
  }

  return null;
};
