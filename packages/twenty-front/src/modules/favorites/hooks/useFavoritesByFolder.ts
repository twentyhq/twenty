import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { useRecoilValue } from 'recoil';
import { useFavoritesMetadata } from './useFavoritesMetadata';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';
import { usePrefetchedFavoritesFoldersData } from './usePrefetchedFavoritesFoldersData';

export const useFavoritesByFolder = () => {
  const { favorites } = usePrefetchedFavoritesData();
  const { favoriteFolders } = usePrefetchedFavoritesFoldersData();
  const {
    objectMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    favoriteRelationFields,
  } = useFavoritesMetadata();

  const prefetchViews = useRecoilValue(prefetchViewsState);

  const favoritesByFolder = favoriteFolders.map((folder) => ({
    folderId: folder.id,
    folderName: folder.name,
    favorites: sortFavorites(
      favorites.filter((favorite) => favorite.favoriteFolderId === folder.id),
      favoriteRelationFields,
      getObjectRecordIdentifierByNameSingular,
      true,
      prefetchViews,
      objectMetadataItems,
    ),
  }));

  return { favoritesByFolder };
};
