import { type Decorator } from '@storybook/react-vite';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';
import { useEffect, useState } from 'react';

export const PrefetchLoadingDecorator: Decorator = (Story, context) => {
  const { parameters } = context;

  const prefetchLoadingSetDelay = parameters.prefetchLoadingSetDelay ?? 0;

  const setAreFavoritesFoldersPrefetched = useSetFamilyRecoilStateV2(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavoritesFolders,
  );

  const setAreFavoritesPrefetched = useSetFamilyRecoilStateV2(
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
      setAreFavoritesPrefetched(false);
      setAreFavoritesFoldersPrefetched(false);
    }, prefetchLoadingSetDelay);
  }, [
    isInitialized,
    prefetchLoadingSetDelay,
    setAreFavoritesFoldersPrefetched,
    setAreFavoritesPrefetched,
  ]);

  return <Story />;
};
