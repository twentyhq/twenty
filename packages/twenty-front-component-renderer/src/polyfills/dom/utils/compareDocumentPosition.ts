import { isObject } from '@sniptt/guards';

import { DOCUMENT_POSITION_FLAG_BY_NAME } from '@/polyfills/dom/constants/DocumentPositionFlagByName';
import { collectAncestorChainFromRootToNode } from '@/polyfills/dom/utils/collectAncestorChainFromRootToNode';
import { findFirstDivergingAncestorIndex } from '@/polyfills/dom/utils/findFirstDivergingAncestorIndex';
import { resolveChildNodeIndexInParent } from '@/polyfills/dom/utils/resolveChildNodeIndexInParent';

const NON_NODE_ARGUMENT_ERROR_MESSAGE =
  "Failed to execute 'compareDocumentPosition' on 'Node': parameter 1 is not of type 'Node'.";

export const compareDocumentPosition = ({
  node,
  otherNode,
  nodePrototype,
  resolveDisconnectedRootOrder,
}: {
  node: object;
  otherNode: unknown;
  nodePrototype: object;
  resolveDisconnectedRootOrder: (root: object) => number;
}): number => {
  if (!isObject(otherNode) || !nodePrototype.isPrototypeOf(otherNode)) {
    throw new TypeError(NON_NODE_ARGUMENT_ERROR_MESSAGE);
  }

  if (otherNode === node) {
    return 0;
  }

  const thisChain = collectAncestorChainFromRootToNode(node);
  const otherChain = collectAncestorChainFromRootToNode(otherNode);

  if (thisChain[0] !== otherChain[0]) {
    const doesOtherRootPrecedeThisRoot =
      resolveDisconnectedRootOrder(otherChain[0]) <
      resolveDisconnectedRootOrder(thisChain[0]);

    return (
      DOCUMENT_POSITION_FLAG_BY_NAME.DISCONNECTED |
      DOCUMENT_POSITION_FLAG_BY_NAME.IMPLEMENTATION_SPECIFIC |
      (doesOtherRootPrecedeThisRoot
        ? DOCUMENT_POSITION_FLAG_BY_NAME.PRECEDING
        : DOCUMENT_POSITION_FLAG_BY_NAME.FOLLOWING)
    );
  }

  const divergenceIndex = findFirstDivergingAncestorIndex({
    firstChain: thisChain,
    secondChain: otherChain,
  });

  if (divergenceIndex === otherChain.length) {
    return (
      DOCUMENT_POSITION_FLAG_BY_NAME.CONTAINS |
      DOCUMENT_POSITION_FLAG_BY_NAME.PRECEDING
    );
  }

  if (divergenceIndex === thisChain.length) {
    return (
      DOCUMENT_POSITION_FLAG_BY_NAME.CONTAINED_BY |
      DOCUMENT_POSITION_FLAG_BY_NAME.FOLLOWING
    );
  }

  const commonParent = thisChain[divergenceIndex - 1];
  const thisBranchIndex = resolveChildNodeIndexInParent({
    parent: commonParent,
    child: thisChain[divergenceIndex],
  });
  const otherBranchIndex = resolveChildNodeIndexInParent({
    parent: commonParent,
    child: otherChain[divergenceIndex],
  });

  return otherBranchIndex < thisBranchIndex
    ? DOCUMENT_POSITION_FLAG_BY_NAME.PRECEDING
    : DOCUMENT_POSITION_FLAG_BY_NAME.FOLLOWING;
};
