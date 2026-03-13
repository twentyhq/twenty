import { useRef } from 'react';

export const useIsHeadlessEngineCommandEffectInitialized = () => {
  // eslint-disable-next-line twenty/no-state-useref
  const hasBeenInitializedRef = useRef(false);

  const isInitialized = hasBeenInitializedRef.current;

  const setIsInitialized = (value: boolean) => {
    hasBeenInitializedRef.current = value;
  };

  return { isInitialized, setIsInitialized };
};
