export const createSubscriptionStub = () => {
  const listeners = new Set<() => void>();
  const unsubscribe = jest.fn();

  const subscribe = jest.fn((listener: () => void) => {
    listeners.add(listener);

    return () => {
      listeners.delete(listener);
      unsubscribe();
    };
  });

  const notify = () => {
    for (const listener of [...listeners]) {
      listener();
    }
  };

  return { subscribe, unsubscribe, notify };
};
