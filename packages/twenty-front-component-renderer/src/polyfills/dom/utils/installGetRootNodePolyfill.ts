import { collectAncestorChainFromRootToNode } from '@/polyfills/dom/utils/collectAncestorChainFromRootToNode';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';

export const installGetRootNodePolyfill = (nodePrototype: object): void => {
  definePolyfillMethod({
    target: nodePrototype,
    methodName: 'getRootNode',
    method: (node: object): object =>
      collectAncestorChainFromRootToNode(node)[0] ?? node,
  });
};
