import { isAncestorOrSelfOfNode } from '@/polyfills/dom/utils/isAncestorOrSelfOfNode';
import { definePolyfillMethod } from '@/polyfills/utils/definePolyfillMethod';

export const installNodeContainsPolyfill = (nodePrototype: object): void => {
  definePolyfillMethod({
    target: nodePrototype,
    methodName: 'contains',
    method: (node: object, otherNode: unknown): boolean =>
      isAncestorOrSelfOfNode(node, otherNode),
  });
};
