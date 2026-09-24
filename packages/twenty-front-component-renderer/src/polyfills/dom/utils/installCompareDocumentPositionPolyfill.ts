import { isObject } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { DOCUMENT_POSITION_FLAG_BY_NAME } from '@/polyfills/dom/constants/DocumentPositionFlagByName';
import { collectAncestorChainFromRootToNode } from '@/polyfills/dom/utils/collectAncestorChainFromRootToNode';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';

type NodeWithChildNodes = {
  childNodes?: ArrayLike<unknown>;
};

type InstallCompareDocumentPositionPolyfillInput = {
  nodeConstructor: object;
  nodePrototype: object;
};

const NON_NODE_ARGUMENT_ERROR_MESSAGE =
  "Failed to execute 'compareDocumentPosition' on 'Node': parameter 1 is not of type 'Node'.";

const findFirstDivergingAncestorIndex = ({
  firstChain,
  secondChain,
}: {
  firstChain: object[];
  secondChain: object[];
}): number => {
  let index = 0;

  while (
    index < firstChain.length &&
    index < secondChain.length &&
    firstChain[index] === secondChain[index]
  ) {
    index += 1;
  }

  return index;
};

const resolveChildNodeIndexInParent = ({
  parent,
  child,
}: {
  parent: object;
  child: object;
}): number => {
  const childNodes = (parent as NodeWithChildNodes).childNodes;

  return isDefined(childNodes)
    ? Array.prototype.indexOf.call(childNodes, child)
    : -1;
};

export const installCompareDocumentPositionPolyfill = ({
  nodeConstructor,
  nodePrototype,
}: InstallCompareDocumentPositionPolyfillInput): void => {
  const orderByDisconnectedRoot = new WeakMap<object, number>();
  let nextDisconnectedRootOrder = 0;

  const resolveDisconnectedRootOrder = (root: object): number => {
    const existingOrder = orderByDisconnectedRoot.get(root);

    if (isDefined(existingOrder)) {
      return existingOrder;
    }

    const order = nextDisconnectedRootOrder;

    nextDisconnectedRootOrder += 1;
    orderByDisconnectedRoot.set(root, order);

    return order;
  };

  const compareDocumentPosition = (
    node: object,
    otherNode: unknown,
  ): number => {
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

  for (const [flagName, flagValue] of Object.entries(
    DOCUMENT_POSITION_FLAG_BY_NAME,
  )) {
    for (const target of [nodeConstructor, nodePrototype]) {
      Object.defineProperty(target, `DOCUMENT_POSITION_${flagName}`, {
        value: flagValue,
        configurable: true,
      });
    }
  }

  definePolyfillMethod({
    target: nodePrototype,
    methodName: 'compareDocumentPosition',
    method: compareDocumentPosition,
  });
};
