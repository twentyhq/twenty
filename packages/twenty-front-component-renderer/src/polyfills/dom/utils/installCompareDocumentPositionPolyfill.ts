import { DOCUMENT_POSITION_FLAG_BY_NAME } from '@/polyfills/dom/constants/DocumentPositionFlagByName';
import { compareDocumentPosition } from '@/polyfills/dom/utils/compareDocumentPosition';
import { createDisconnectedRootOrderResolver } from '@/polyfills/dom/utils/createDisconnectedRootOrderResolver';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';

type InstallCompareDocumentPositionPolyfillInput = {
  nodeConstructor: object;
  nodePrototype: object;
};

export const installCompareDocumentPositionPolyfill = ({
  nodeConstructor,
  nodePrototype,
}: InstallCompareDocumentPositionPolyfillInput): void => {
  const resolveDisconnectedRootOrder = createDisconnectedRootOrderResolver();

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
    method: (node, otherNode) =>
      compareDocumentPosition({
        node,
        otherNode,
        nodePrototype,
        resolveDisconnectedRootOrder,
      }),
  });
};
