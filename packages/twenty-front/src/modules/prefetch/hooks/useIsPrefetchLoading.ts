import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useIsWorkspaceActivationStatusSuspended } from '@/workspace/hooks/useIsWorkspaceActivationStatusSuspended';
import { useRecoilValue } from 'recoil';

export const useIsPrefetchLoading = () => {
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusSuspended();
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
    !isWorkspaceSuspended &&
    (!areViewsPrefetched ||
      !areFavoritesPrefetched ||
      !isFavoriteFoldersPrefetched)
  );
};
