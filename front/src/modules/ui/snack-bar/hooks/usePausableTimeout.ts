import { useCallback, useEffect, useRef } from 'react';

export function usePausableTimeout(callback: () => void, delay: number) {
  const savedCallback = useRef<() => void>(callback);
  const remainingTime = useRef<number>(delay);
  const startTime = useRef<number>(Date.now());
  const timeoutId = useRef<ReturnType<typeof setTimeout> | null>(null);

  const tick = () => {
    if (savedCallback.current) {
      savedCallback.current();
    }
  };

  const startTimeout = useCallback(() => {
    startTime.current = Date.now();
    timeoutId.current = setTimeout(tick, remainingTime.current);
  }, []);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout loop
  useEffect(() => {
    if (delay !== null) {
      startTimeout();
      return () => {
        if (timeoutId.current) {
          clearTimeout(timeoutId.current);
        }
      };
    }
  }, [delay, startTimeout]);

  const pauseTimeout = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }
    const elapsedTime = Date.now() - startTime.current;
    remainingTime.current = remainingTime.current - elapsedTime;
  };

  const resumeTimeout = () => {
    startTimeout();
  };

  return { pauseTimeout, resumeTimeout };
}
