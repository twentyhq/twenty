type NodeLike = {
  parentNode: unknown;
};

export const installElementContains = (elementPrototype: object): void => {
  Object.defineProperty(elementPrototype, 'contains', {
    value: function (this: NodeLike, other: unknown): boolean {
      let currentNode: unknown = other;

      while (currentNode != null) {
        if (currentNode === this) {
          return true;
        }
        currentNode = (currentNode as NodeLike).parentNode;
      }

      return false;
    },
    configurable: true,
    writable: true,
  });
};
