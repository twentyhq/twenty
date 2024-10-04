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

  setAreViewsPrefetched(true);
  setAreFavoritesPrefetched(true);

  return <Story />;
};
