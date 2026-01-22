import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';

export const useRenameFavoriteFolder = () => {
  const { updateOneRecord } = useUpdateOneRecord();

  const renameFavoriteFolder = async (
    folderId: string,
    newName: string,
  ): Promise<void> => {
    if (!newName) {
      return;
    }

    await updateOneRecord({
      objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
      idToUpdate: folderId,
      updateOneRecordInput: {
        name: newName,
      },
    });
  };

  return {
    renameFavoriteFolder,
  };
};
