import { useRecoilValue } from 'recoil';

import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';

export const useIsPrefetchLoading = () => {
  const areViewsPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllViews),
  );
  const areFavoritesPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );

  const areFavoritesFolderPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  return (
    !areViewsPrefetched ||
    !areFavoritesPrefetched ||
    !areFavoritesFolderPrefetched
  );
};
