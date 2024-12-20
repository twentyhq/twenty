import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilValue } from 'recoil';

export const useIsPrefetchLoading = () => {
  const isFavoriteFoldersPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  const areViewsPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllViews),
  );
  const areFavoritesPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );

  return (
    !areViewsPrefetched ||
    !areFavoritesPrefetched ||
    !isFavoriteFoldersPrefetched
  );
};
