import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useFavoritesMetadata } from './useFavoritesMetadata';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';
import { usePrefetchedFavoritesFoldersData } from './usePrefetchedFavoritesFoldersData';

export const useFavoritesByFolder = () => {
  const { favorites } = usePrefetchedFavoritesData();
  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();
  const {
    views,
    objectMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    favoriteRelationFields,
  } = useFavoritesMetadata();

  const favoritesByFolder = favoriteFolders.map((folder) => ({
    folderId: folder.id,
    folderName: folder.name,
    favorites: sortFavorites(
      favorites.filter((favorite) => favorite.favoriteFolderId === folder.id),
      favoriteRelationFields,
      getObjectRecordIdentifierByNameSingular,
      true,
      views,
      objectMetadataItems,
    ),
  }));

  return { favoritesByFolder };
};
