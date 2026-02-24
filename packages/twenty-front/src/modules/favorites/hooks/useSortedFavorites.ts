import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useAtomValue } from '@/ui/utilities/state/jotai/hooks/useAtomValue';
import { coreViewsState } from '@/views/states/coreViewState';
import { convertCoreViewToView } from '@/views/utils/convertCoreViewToView';
import { useMemo } from 'react';
import { useFavoritesMetadata } from './useFavoritesMetadata';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useSortedFavorites = () => {
  const { favorites, workspaceFavorites } = usePrefetchedFavoritesData();
  const {
    objectMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    favoriteRelationFields,
  } = useFavoritesMetadata();

  const coreViews = useAtomValue(coreViewsState).map(convertCoreViewToView);

  const favoritesSorted = useMemo(() => {
    return sortFavorites(
      favorites,
      favoriteRelationFields,
      getObjectRecordIdentifierByNameSingular,
      true,
      coreViews,
      objectMetadataItems,
    );
  }, [
    coreViews,
    favoriteRelationFields,
    favorites,
    getObjectRecordIdentifierByNameSingular,
    objectMetadataItems,
  ]);

  const workspaceFavoritesSorted = useMemo(() => {
    return sortFavorites(
      workspaceFavorites.filter((favorite) => favorite.viewId),
      favoriteRelationFields,
      getObjectRecordIdentifierByNameSingular,
      false,
      coreViews,
      objectMetadataItems,
    );
  }, [
    workspaceFavorites,
    favoriteRelationFields,
    getObjectRecordIdentifierByNameSingular,
    coreViews,
    objectMetadataItems,
  ]);

  return {
    favoritesSorted,
    workspaceFavoritesSorted,
  };
};
