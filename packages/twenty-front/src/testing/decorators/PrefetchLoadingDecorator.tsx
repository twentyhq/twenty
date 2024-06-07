import { Decorator } from '@storybook/react';
import { useSetRecoilState } from 'recoil';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const PrefetchLoadingDecorator: Decorator = (Story) => {
  const setAreViewsPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllViews),
  );
  const setAreFavoritesPrefetched = useSetRecoilState(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );

  setAreViewsPrefetched(false);
  setAreFavoritesPrefetched(false);

  return <Story />;
};
