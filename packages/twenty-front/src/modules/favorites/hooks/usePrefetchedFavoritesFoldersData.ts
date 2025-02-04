import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { useUpsertRecordsInCacheForPrefetchKey } from '@/prefetch/hooks/internal/useUpsertRecordsInCacheForPrefetchKey';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilValue } from 'recoil';

type PrefetchedFavoritesFoldersData = {
  favoriteFolders: FavoriteFolder[];
  upsertFavoriteFolders: (records: FavoriteFolder[]) => void;
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesFoldersData =
  (): PrefetchedFavoritesFoldersData => {
    const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;

    const { records: favoriteFolders } = usePrefetchedData<FavoriteFolder>(
      PrefetchKey.AllFavoritesFolders,
      {
        workspaceMemberId: {
          eq: currentWorkspaceMemberId,
        },
      },
    );

    const { upsertRecordsInCache: upsertFavoriteFolders } =
      useUpsertRecordsInCacheForPrefetchKey<FavoriteFolder>({
        prefetchKey: PrefetchKey.AllFavoritesFolders,
      });

    return {
      favoriteFolders,
      upsertFavoriteFolders,
      currentWorkspaceMemberId,
    };
  };
