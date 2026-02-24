import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useFamilyAtomValue } from '@/ui/utilities/state/jotai/hooks/useFamilyAtomValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const useIsPrefetchLoading = () => {
  const isWorkspaceActive = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.ACTIVE,
  );
  const isFavoriteFoldersPrefetched = useFamilyAtomValue(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavoritesFolders,
  );

  const areFavoritesPrefetched = useFamilyAtomValue(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavorites,
  );

  return (
    isWorkspaceActive &&
    (!areFavoritesPrefetched || !isFavoriteFoldersPrefetched)
  );
};
