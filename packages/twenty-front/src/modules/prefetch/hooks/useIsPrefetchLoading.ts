import { prefetchIsLoadedFamilyState } from '@/prefetch/states/prefetchIsLoadedFamilyState';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useFamilyRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useFamilyRecoilValueV2';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

export const useIsPrefetchLoading = () => {
  const isWorkspaceActive = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.ACTIVE,
  );
  const isFavoriteFoldersPrefetched = useFamilyRecoilValueV2(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavoritesFolders,
  );

  const areFavoritesPrefetched = useFamilyRecoilValueV2(
    prefetchIsLoadedFamilyState,
    PrefetchKey.AllFavorites,
  );

  return (
    isWorkspaceActive &&
    (!areFavoritesPrefetched || !isFavoriteFoldersPrefetched)
  );
};
