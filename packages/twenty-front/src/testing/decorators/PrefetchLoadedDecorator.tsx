import { type Decorator } from '@storybook/react-vite';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useSetFamilyAtomState } from '@/ui/utilities/state/jotai/hooks/useSetFamilyAtomState';

export const PrefetchLoadedDecorator: Decorator = (Story) => {
  const setAreFavoritesPrefetched = useSetFamilyAtomState(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavorites,
  );
  const setAreFavoritesFoldersPrefetched = useSetFamilyAtomState(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavoritesFolders,
  );

  setAreFavoritesPrefetched(true);
  setAreFavoritesFoldersPrefetched(true);

  return <Story />;
};
