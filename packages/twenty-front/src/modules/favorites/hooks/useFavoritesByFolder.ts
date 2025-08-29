import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { coreViewsState } from '@/views/states/coreViewState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useRecoilValue } from 'recoil';
import { FeatureFlagKey } from '~/generated/graphql';
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
  const coreViews = useRecoilValue(coreViewsState);

  const isCoreViewEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CORE_VIEW_ENABLED,
  );

  const views = isCoreViewEnabled ? coreViews : prefetchViews;

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
