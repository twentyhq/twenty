import { type Decorator } from '@storybook/react-vite';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useSetFamilyRecoilStateV2 } from '@/ui/utilities/state/jotai/hooks/useSetFamilyRecoilStateV2';

export const PrefetchLoadedDecorator: Decorator = (Story) => {
  const setAreFavoritesPrefetched = useSetFamilyRecoilStateV2(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavorites,
  );
  const setAreFavoritesFoldersPrefetched = useSetFamilyRecoilStateV2(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavoritesFolders,
  );

  setAreFavoritesPrefetched(true);
  setAreFavoritesFoldersPrefetched(true);

  return <Story />;
};
