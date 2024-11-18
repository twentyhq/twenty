import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilValue } from 'recoil';

export const useIsFavoriteFoldersPrefetchLoading = () => {
  const areFavoritesFolderPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  return !areFavoritesFolderPrefetched;
};
