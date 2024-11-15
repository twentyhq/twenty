import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { usePrefetchRunQuery } from '@/prefetch/hooks/internal/usePrefetchRunQuery';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';

type PrefetchedFavoritesFoldersData = {
  folders: FavoriteFolder[];
  upsertFolders: (records: FavoriteFolder[]) => void;
  currentWorkspaceMemberId: string | undefined;
};

export const usePrefetchedFavoritesFoldersData =
  (): PrefetchedFavoritesFoldersData => {
    const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);
    const currentWorkspaceMemberId = currentWorkspaceMember?.id;

    const { records: _folders } = usePrefetchedData<FavoriteFolder>(
      PrefetchKey.AllFavoritesFolders,
      {
        workspaceMemberId: {
          eq: currentWorkspaceMemberId,
        },
      },
    );

    const folders = useMemo(() => _folders, [_folders]);

    const { upsertRecordsInCache: upsertFolders } =
      usePrefetchRunQuery<FavoriteFolder>({
        prefetchKey: PrefetchKey.AllFavoritesFolders,
      });

    return useMemo(
      () => ({
        folders,
        upsertFolders,
        currentWorkspaceMemberId,
      }),
      [folders, upsertFolders, currentWorkspaceMemberId],
    );
  };
