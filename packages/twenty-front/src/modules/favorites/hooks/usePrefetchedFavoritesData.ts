import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Favorite } from '@/favorites/types/Favorite';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilValue } from 'recoil';

type PrefetchedFavoritesData = {
  favorites: Favorite[];
  workspaceFavorites: Favorite[];
  upsertFavorites: (records: Favorite[]) => void;
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesData = (): PrefetchedFavoritesData => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;
  const { records: _favorites } = usePrefetchedData<Favorite>(
    PrefetchKey.AllFavorites,
    {
      workspaceMemberId: {
        eq: currentWorkspaceMemberId,
      },
    },
  );

  const favorites = _favorites.filter(
    (favorite) => favorite.workspaceMemberId === currentWorkspaceMemberId,
  );

  const workspaceFavorites = _favorites.filter(
    (favorite) => favorite.workspaceMemberId === null,
  );

  const { upsertRecordsInCache: upsertFavorites } =
    usePrefetchRunQuery<Favorite>({
      prefetchKey: PrefetchKey.AllFavorites,
    });

  return {
    favorites,
    workspaceFavorites,
    upsertFavorites,
    currentWorkspaceMemberId,
  };
};
