import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type Favorite } from '@/favorites/types/Favorite';
import { prefetchFavoritesState } from '@/prefetch/states/prefetchFavoritesState';
import { useRecoilValue } from 'recoil';

type PrefetchedFavoritesData = {
  favorites: Favorite[];
  workspaceFavorites: Favorite[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesData = (): PrefetchedFavoritesData => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const prefetchFavorites = useRecoilValue(prefetchFavoritesState);

  const favorites = prefetchFavorites.filter(
    (favorite) => favorite.forWorkspaceMemberId === currentWorkspaceMemberId,
  );

  const workspaceFavorites = prefetchFavorites.filter(
    (favorite) => favorite.forWorkspaceMemberId === null,
  );

  return {
    favorites,
    workspaceFavorites,
    currentWorkspaceMemberId,
  };
};
