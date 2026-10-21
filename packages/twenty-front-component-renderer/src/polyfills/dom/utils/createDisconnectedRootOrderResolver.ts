import { isDefined } from 'twenty-shared/utils';

export const createDisconnectedRootOrderResolver = (): ((
  root: object,
) => number) => {
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

  return resolveDisconnectedRootOrder;
};
