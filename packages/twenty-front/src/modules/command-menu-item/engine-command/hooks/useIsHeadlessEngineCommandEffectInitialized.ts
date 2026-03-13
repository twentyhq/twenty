import { useRef } from 'react';

export const useIsHeadlessEngineCommandEffectInitialized = () => {
  // eslint-disable-next-line twenty/no-state-useref
  const isInitializedRef = useRef(false);

  const getIsInitialized = () => {
    return isInitializedRef.current;
  };

  const setIsInitialized = (value: boolean) => {
    isInitializedRef.current = value;
  };

  return { getIsInitialized, setIsInitialized };
};
