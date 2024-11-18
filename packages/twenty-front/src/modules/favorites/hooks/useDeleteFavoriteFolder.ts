import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useDeleteOneRecord } from '@/object-record/hooks/useDeleteOneRecord';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useDeleteFavoriteFolder = () => {
  const { deleteOneRecord } = useDeleteOneRecord({
    objectNameSingular: CoreObjectNameSingular.FavoriteFolder,
  });
  const { upsertFavorites, favorites, workspaceFavorites } =
    usePrefetchedFavoritesData();

  const deleteFavoriteFolder = async (folderId: string): Promise<void> => {
    await deleteOneRecord(folderId);

    const updatedFavorites = [
      ...favorites.filter((favorite) => favorite.favoriteFolderId !== folderId),
      ...workspaceFavorites,
    ];

    upsertFavorites(updatedFavorites);
  };

  return {
    deleteFavoriteFolder,
  };
};
