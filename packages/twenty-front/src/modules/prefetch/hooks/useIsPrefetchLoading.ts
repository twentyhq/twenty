import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { useIsFavoriteFoldersPrefetchLoading } from './useIsFavoriteFoldersPrefetchLoading';

export const useIsPrefetchLoading = () => {
  const isFavoriteFolderEnabled = useIsFeatureEnabled(
    'IS_FAVORITE_FOLDER_ENABLED',
  );
  const isFavoriteFoldersLoading = useIsFavoriteFoldersPrefetchLoading();

  const areViewsPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllViews),
  );
  const areFavoritesPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );

  return (
    !areViewsPrefetched ||
    !areFavoritesPrefetched ||
    (isFavoriteFolderEnabled && isFavoriteFoldersLoading)
  );
};
