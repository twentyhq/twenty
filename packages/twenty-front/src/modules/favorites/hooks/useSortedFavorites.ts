import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { prefetchViewsState } from '@/prefetch/states/prefetchViewsState';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { useFavoritesMetadata } from './useFavoritesMetadata';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useSortedFavorites = () => {
  const { favorites, workspaceFavorites } = usePrefetchedFavoritesData();
  const {
    objectMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    favoriteRelationFields,
  } = useFavoritesMetadata();

  const prefetchViews = useRecoilValue(prefetchViewsState);

  const favoritesSorted = useMemo(() => {
    return sortFavorites(
      favorites,
      favoriteRelationFields,
      getObjectRecordIdentifierByNameSingular,
      true,
      prefetchViews,
      objectMetadataItems,
    );
  }, [
    favoriteRelationFields,
    favorites,
    getObjectRecordIdentifierByNameSingular,
    objectMetadataItems,
    prefetchViews,
  ]);

  const workspaceFavoritesSorted = useMemo(() => {
    return sortFavorites(
      workspaceFavorites.filter((favorite) => favorite.viewId),
      favoriteRelationFields,
      getObjectRecordIdentifierByNameSingular,
      false,
      prefetchViews,
      objectMetadataItems,
    );
  }, [
    workspaceFavorites,
    favoriteRelationFields,
    getObjectRecordIdentifierByNameSingular,
    prefetchViews,
    objectMetadataItems,
  ]);

  return {
    favoritesSorted,
    workspaceFavoritesSorted,
  };
};
