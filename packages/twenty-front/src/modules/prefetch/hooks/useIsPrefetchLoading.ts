import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const useIsPrefetchLoading = () => {
  const isWorkspaceActive = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.ACTIVE,
  );
  const isFavoriteFoldersPrefetched = useAtomFamilyStateValue(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavoritesFolders,
  );

  const areFavoritesPrefetched = useAtomFamilyStateValue(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavorites,
  );

  return (
    isWorkspaceActive &&
    (!areFavoritesPrefetched || !isFavoriteFoldersPrefetched)
  );
};
