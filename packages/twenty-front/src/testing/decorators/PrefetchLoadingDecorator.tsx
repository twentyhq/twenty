import { type Decorator } from '@storybook/react-vite';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useEffect, useState } from 'react';

export const PrefetchLoadingDecorator: Decorator = (Story, context) => {
  const { parameters } = context;

  const prefetchLoadingSetDelay = parameters.prefetchLoadingSetDelay ?? 0;

  const setPrefetchIsLoaded = useSetAtomFamilyState(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavoritesFolders,
  );

  // eslint-disable-next-line twenty/matching-state-variable
  const setPrefetchIsLoadedFavorites = useSetAtomFamilyState(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavorites,
  );

  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (isInitialized) {
      return;
    }

    setIsInitialized(true);

    setTimeout(() => {
      setPrefetchIsLoadedFavorites(false);
      setPrefetchIsLoaded(false);
    }, prefetchLoadingSetDelay);
  }, [
    isInitialized,
    prefetchLoadingSetDelay,
    setPrefetchIsLoaded,
    setPrefetchIsLoadedFavorites,
  ]);

  return <Story />;
};
