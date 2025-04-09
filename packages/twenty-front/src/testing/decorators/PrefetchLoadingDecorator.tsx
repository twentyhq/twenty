import { Decorator } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const PrefetchLoadingDecorator: Decorator = (Story) => {
  const setAreFavoritesPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  setAreFavoritesPrefetched(false);

  return <Story />;
};
