import { isDefined } from 'twenty-shared/utils';

export const installNodeContains = (nodePrototype: object): void => {
  Object.defineProperty(nodePrototype, 'contains', {
    value: function (this: Node, node: Node | null): boolean {
      let currentNode = node;

      while (isDefined(currentNode)) {
        if (currentNode === this) {
          return true;
        }

        currentNode = currentNode.parentNode;
      }

      return false;
    },
    configurable: true,
    writable: true,
  });
};
