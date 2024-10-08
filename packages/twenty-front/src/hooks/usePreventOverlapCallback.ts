import { useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

export const usePreventOverlapCallback = (
  callback: () => Promise<void>,
  wait?: number,
) => {
  const [isRunning, setIsRunning] = useState(false);
  const [pendingRun, setPendingRun] = useState(false);

  const handleCallback = async () => {
    if (isRunning) {
      setPendingRun(true);
      return;
    }
    setIsRunning(true);
    try {
      await callback();
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    if (!isRunning && pendingRun) {
      setPendingRun(false);
      callback();
    }
  }, [callback, isRunning, pendingRun, setPendingRun]);

  return useDebouncedCallback(handleCallback, wait);
};
