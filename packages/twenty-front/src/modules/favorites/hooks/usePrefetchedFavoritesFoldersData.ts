import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { prefetchFavoriteFoldersState } from '@/prefetch/states/prefetchFavoriteFoldersState';
import { useRecoilValue } from 'recoil';

type PrefetchedFavoritesFoldersData = {
  favoriteFolders: FavoriteFolder[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesFoldersData =
  (): PrefetchedFavoritesFoldersData => {
    const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;

    const prefetchFavoriteFolders = useRecoilValue(
      prefetchFavoriteFoldersState,
    );

    return {
      favoriteFolders: prefetchFavoriteFolders,
      currentWorkspaceMemberId,
    };
  };
