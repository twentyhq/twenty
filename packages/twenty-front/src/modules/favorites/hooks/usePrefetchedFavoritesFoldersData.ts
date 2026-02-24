import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { prefetchFavoriteFoldersState } from '@/prefetch/states/prefetchFavoriteFoldersState';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';

type PrefetchedFavoritesFoldersData = {
  favoriteFolders: FavoriteFolder[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesFoldersData =
  (): PrefetchedFavoritesFoldersData => {
    const currentWorkspaceMember = useAtomValue(currentWorkspaceMemberState);
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;

    const prefetchFavoriteFolders = useAtomValue(prefetchFavoriteFoldersState);

    return {
      favoriteFolders: prefetchFavoriteFolders,
      currentWorkspaceMemberId,
    };
  };
