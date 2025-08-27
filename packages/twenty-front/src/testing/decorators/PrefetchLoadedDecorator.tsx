import { type Decorator } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const PrefetchLoadedDecorator: Decorator = (Story) => {
  const setAreFavoritesPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );
  const setAreFavoritesFoldersPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  setAreFavoritesPrefetched(true);
  setAreFavoritesFoldersPrefetched(true);

  return <Story />;
};
