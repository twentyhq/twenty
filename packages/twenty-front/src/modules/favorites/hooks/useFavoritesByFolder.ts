import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useRecoilValueV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilValueV2';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
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

  const coreViews = useRecoilValueV2(coreViewsState);

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
