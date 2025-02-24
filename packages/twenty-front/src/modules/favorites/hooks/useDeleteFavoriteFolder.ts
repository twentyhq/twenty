import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';

export const useDeleteFavoriteFolder = () => {
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });

  const deleteFavoriteFolder = async (folderId: string): Promise<void> => {
    await deleteOneRecord(folderId);
  };

  return {
    deleteFavoriteFolder,
  };
};
