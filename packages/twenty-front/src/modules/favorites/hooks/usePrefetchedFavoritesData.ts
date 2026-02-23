import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { type Favorite } from '@/favorites/types/Favorite';
import { prefetchFavoritesState } from '@/prefetch/states/prefetchFavoritesState';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';

type PrefetchedFavoritesData = {
  favorites: Favorite[];
  workspaceFavorites: Favorite[];
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesData = (): PrefetchedFavoritesData => {
  const currentWorkspaceMember = useRecoilValueV2(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const prefetchFavorites = useRecoilValueV2(prefetchFavoritesState);

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
