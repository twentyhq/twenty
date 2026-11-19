import { type Atom, type createStore } from 'jotai';

export const waitForAtomValue = <TValue>({
  store,
  atom,
  isExpectedValue,
}: {
  store: ReturnType<typeof createStore>;
  atom: Atom<TValue>;
  isExpectedValue: (value: TValue) => boolean;
}): Promise<void> =>
  new Promise((resolve) => {
    if (isExpectedValue(store.get(atom))) {
      resolve();
      return;
    }

    const unsubscribe = store.sub(atom, () => {
      if (isExpectedValue(store.get(atom))) {
        unsubscribe();
        resolve();
      }
    });
  });
