import { Decorator } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const PrefetchLoadedDecorator: Decorator = (Story) => {
  const setAreViewsPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllViews),
  );
  const setAreFavoritesPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );
  const setAreFavoritesFoldersPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  setAreViewsPrefetched(true);
  setAreFavoritesPrefetched(true);
  setAreFavoritesFoldersPrefetched(true);

  return <Story />;
};
