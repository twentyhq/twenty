import { useEffect, useMemo, useRef } from 'react';

export const useDebouncedCallback = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delayMilliseconds: number,
): ((...args: TArgs) => void) => {
  const callbackRef = useRef(callback);
  callbackRef.current = callback;

  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  useEffect(
    () => () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current);
      }
    },
    [],
  );

  return useMemo(
    () =>
      (...args: TArgs) => {
        if (timeoutRef.current !== undefined) {
          clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
        }, delayMilliseconds);
      },
    [delayMilliseconds],
  );
};
