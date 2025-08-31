import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
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

  const coreViews = useRecoilValue(coreViewsState);

  const views = coreViews.map(convertCoreViewToView);

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
