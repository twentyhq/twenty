import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { prefetchFavoriteFoldersState } from '@/prefetch/states/prefetchFavoriteFoldersState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

type PrefetchedFavoritesFoldersData = {
  favoriteFolders: FavoriteFolder[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesFoldersData =
  (): PrefetchedFavoritesFoldersData => {
    const currentWorkspaceMember = useRecoilValueV2(
      currentWorkspaceMemberState,
    );
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;

    const prefetchFavoriteFolders = useRecoilValueV2(
      prefetchFavoriteFoldersState,
    );

    return {
      favoriteFolders: prefetchFavoriteFolders,
      currentWorkspaceMemberId,
    };
  };
