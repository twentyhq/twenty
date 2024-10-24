import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FavoriteFolder } from '@/favorites/types/FavoriteFolder';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilValue } from 'recoil';

export const useFavoriteFolders = () => {
  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { updateOneRecord: updateOneFavorite } = useUpdateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { createOneRecord: createFavoriteFolder } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const { records: favoriteFolder } = usePrefetchedData<FavoriteFolder>(
    PrefetchKey.AllFavoritesFolders,
    {
      workspaceMemberId: {
        eq: undefined,
      },
    },
  );

  const createFolder = async (name: string): Promise<void> => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    if (!currentWorkspaceMember?.id) {
      return;
    }

    await createFavoriteFolder({
      workspaceMemberId: currentWorkspaceMember.id,
      name: trimmedName,
      position: (favoriteFolder?.length || 0) + 1,
    });
  };

  const renameFolder = async (
    folderId: string,
    newName: string,
  ): Promise<void> => {
    const trimmedName = newName.trim();

    if (!trimmedName) {
      return;
    }

    if (!currentWorkspaceMember?.id) {
      return;
    }

    await updateOneFavorite({
      idToUpdate: folderId,
      updateOneRecordInput: {
        name: trimmedName,
      },
    });
  };

  const deleteFolder = async (folderId: string): Promise<void> => {
    if (!currentWorkspaceMember?.id) {
      return;
    }

    await deleteOneRecord(folderId);
  };

  return {
    favoriteFolder,
    createFolder,
    renameFolder,
    deleteFolder,
  };
};
