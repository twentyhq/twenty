import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';

export const useDeleteFavorite = () => {
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.Favorite,
  });

  const deleteFavorite = async (favoriteId: string) => {
    deleteOneRecord(favoriteId);
  };

  return { deleteFavorite };
};
