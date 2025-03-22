import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { useRecoilValue } from 'recoil';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const useIsPrefetchLoading = () => {
  const isWorkspaceActive = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.ACTIVE,
  );
  const isFavoriteFoldersPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavoritesFolders),
  );

  const areFavoritesPrefetched = useRecoilValue(
    prefetchIsLoadedFamilyState(PrefetchKey.AllFavorites),
  );

  return (
    isWorkspaceActive &&
    (!areFavoritesPrefetched || !isFavoriteFoldersPrefetched)
  );
};
