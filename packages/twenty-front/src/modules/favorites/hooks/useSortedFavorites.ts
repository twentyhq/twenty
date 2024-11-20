import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useMemo } from 'react';
import { useFavoritesMetadata } from './useFavoritesMetadata';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useSortedFavorites = () => {
  const { favorites, workspaceFavorites } = usePrefetchedFavoritesData();
  const {
    views,
    objectMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    favoriteRelationFields,
  } = useFavoritesMetadata();

  const favoritesSorted = useMemo(() => {
    return sortFavorites(
      favorites,
      favoriteRelationFields,
      getObjectRecordIdentifierByNameSingular,
      true,
      views,
      objectMetadataItems,
    );
  }, [
    favoriteRelationFields,
    favorites,
    getObjectRecordIdentifierByNameSingular,
    views,
    objectMetadataItems,
  ]);

  const workspaceFavoritesSorted = useMemo(() => {
    return sortFavorites(
      workspaceFavorites.filter((favorite) => favorite.viewId),
      favoriteRelationFields,
      getObjectRecordIdentifierByNameSingular,
      false,
      views,
      objectMetadataItems,
    );
  }, [
    favoriteRelationFields,
    getObjectRecordIdentifierByNameSingular,
    workspaceFavorites,
    views,
    objectMetadataItems,
  ]);

  return {
    favoritesSorted,
    workspaceFavoritesSorted,
  };
};
