import { useCallback, useTransition } from 'react';

// Runs an async callback inside a transition, so suspense boundaries above
// the caller keep showing their current content instead of falling back,
// while still exposing the callback's settlement as a promise.
export const usePromiseTransition = () => {
  const [isPending, startTransition] = useTransition();

  const startPromiseTransition = useCallback(
    <TResult>(callback: () => Promise<TResult>) =>
      new Promise<TResult>((resolve, reject) => {
        startTransition(async () => {
          try {
            resolve(await callback());
          } catch (error) {
            reject(error);
          }
        });
      }),
    [startTransition],
  );

  return { isPending, startPromiseTransition };
};
