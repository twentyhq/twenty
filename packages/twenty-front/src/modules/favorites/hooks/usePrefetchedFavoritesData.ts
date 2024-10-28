import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { Favorite } from '@/favorites/types/Favorite';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilValue } from 'recoil';

type PrefetchedFavoritesData = {
  favorites: Favorite[];
  workspaceFavorites: Favorite[];
  folders: FavoriteFolder[];
  upsertFavorites: (records: Favorite[]) => void;
  upsertFolders: (records: FavoriteFolder[]) => void;
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesData = (): PrefetchedFavoritesData => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
  const currentWorkspaceMemberId = currentWorkspaceMember?.id;

  const { records: favorites } = usePrefetchedData<Favorite>(
    PrefetchKey.AllFavorites,
    {
      workspaceMemberId: {
        eq: currentWorkspaceMemberId ?? '',
      },
    },
  );

  const { records: workspaceFavorites } = usePrefetchedData<Favorite>(
    PrefetchKey.AllFavorites,
    {
      workspaceMemberId: {
        eq: undefined,
      },
    },
  );

  const { records: folders } = usePrefetchedData<FavoriteFolder>(
    PrefetchKey.AllFavoritesFolders,
    {
      workspaceMemberId: {
        eq: currentWorkspaceMemberId ?? '',
      },
    },
  );

  const { upsertRecordsInCache: upsertFavorites } =
    usePrefetchRunQuery<Favorite>({
      prefetchKey: PrefetchKey.AllFavorites,
    });

  const { upsertRecordsInCache: upsertFolders } =
    usePrefetchRunQuery<FavoriteFolder>({
      prefetchKey: PrefetchKey.AllFavoritesFolders,
    });

  return {
    favorites,
    workspaceFavorites,
    folders,
    upsertFavorites,
    upsertFolders,
    currentWorkspaceMemberId,
  };
};
