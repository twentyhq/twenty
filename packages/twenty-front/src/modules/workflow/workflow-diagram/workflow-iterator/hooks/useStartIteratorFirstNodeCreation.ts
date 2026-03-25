import { useCallback } from 'react';

export const useStartIteratorFirstNodeCreation = () => {
  /**
   * This function is used in a context where dependencies shouldn't change much.
   * That's why its wrapped in a `useCallback` hook. Removing memoization might break the app unexpectedly.
   */
  const startIteratorFirstNodeCreation = useCallback(() => {
    // TODO: to implement
  }, []);

  // TODO: to implement
  const isIteratorFirstNodeCreationStarted = () => {
    return false;
  };

  return {
    startIteratorFirstNodeCreation,
    isIteratorFirstNodeCreationStarted,
  };
};
