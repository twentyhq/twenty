import { type Atom, type createStore } from 'jotai';
import { doNotTranslate } from 'twenty-shared/i18n';

export const waitForAtomValue = <TValue>({
  store,
  atom,
  isExpectedValue,
  abortSignal,
}: {
  store: ReturnType<typeof createStore>;
  atom: Atom<TValue>;
  isExpectedValue: (value: TValue) => boolean;
  abortSignal: AbortSignal;
}): Promise<void> =>
  new Promise((resolve, reject) => {
    if (isExpectedValue(store.get(atom))) {
      resolve();
      return;
    }

    const handleAbort = () => {
      unsubscribe();
      reject(new Error(doNotTranslate('Aborted while waiting for atom value')));
    };

    const unsubscribe = store.sub(atom, () => {
      if (isExpectedValue(store.get(atom))) {
        unsubscribe();
        abortSignal.removeEventListener('abort', handleAbort);
        resolve();
      }
    });

    abortSignal.addEventListener('abort', handleAbort, { once: true });
  });
