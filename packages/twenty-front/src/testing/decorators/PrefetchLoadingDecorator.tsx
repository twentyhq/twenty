import { type Decorator } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useEffect, useState } from 'react';

export const PrefetchLoadingDecorator: Decorator = (Story, context) => {
  const { parameters } = context;

  const prefetchLoadingSetDelay = parameters.prefetchLoadingSetDelay ?? 0;

  const setAreFavoritesFoldersPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  const setAreFavoritesPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
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
