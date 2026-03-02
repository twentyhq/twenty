import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { prefetchFavoriteFoldersState } from '@/prefetch/states/prefetchFavoriteFoldersState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type PrefetchedFavoritesFoldersData = {
  favoriteFolders: FavoriteFolder[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesFoldersData =
  (): PrefetchedFavoritesFoldersData => {
    const currentWorkspaceMember = useAtomStateValue(
      currentWorkspaceMemberState,
    );
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;

    const prefetchFavoriteFolders = useAtomStateValue(
      prefetchFavoriteFoldersState,
    );

    return {
      favoriteFolders: prefetchFavoriteFolders,
      currentWorkspaceMemberId,
    };
  };
