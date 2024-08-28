import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const usePreventOverlapCallback = (
  func: () => Promise<void>,
  wait?: number,
) => {
  const [isRunning, setIsRunning] = useState(false);
  const [pendingRun, setPendingRun] = useState(false);

  const handleFunc = async () => {
    if (isRunning) {
      setPendingRun(true);
      return;
    }
    setIsRunning(true);
    try {
      await func();
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!isRunning && pendingRun) {
      setPendingRun(false);
      func();
    }
  }, [func, isRunning, pendingRun, setPendingRun]);

  return useDebouncedCallback(handleFunc, wait);
};
