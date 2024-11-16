import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useSortedFavorites = () => {
  const { favorites, workspaceFavorites } = usePrefetchedFavoritesData();
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });

  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();

  const favoriteRelationFieldMetadataItems = useMemo(
    () =>
      favoriteObjectMetadataItem.fields.filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type === FieldMetadataType.Relation &&
          fieldMetadataItem.name !== 'workspaceMember' &&
          fieldMetadataItem.name !== 'favoriteFolder',
      ),
    [favoriteObjectMetadataItem.fields],
  );

  const favoritesSorted = useMemo(() => {
    return sortFavorites(
      favorites,
      favoriteRelationFieldMetadataItems,
      getObjectRecordIdentifierByNameSingular,
      true,
      views,
      objectMetadataItems,
    );
  }, [
    favoriteRelationFieldMetadataItems,
    favorites,
    getObjectRecordIdentifierByNameSingular,
    views,
    objectMetadataItems,
  ]);

  const workspaceFavoritesSorted = useMemo(() => {
    return sortFavorites(
      workspaceFavorites.filter((favorite) => favorite.viewId),
      favoriteRelationFieldMetadataItems,
      getObjectRecordIdentifierByNameSingular,
      false,
      views,
      objectMetadataItems,
    );
  }, [
    favoriteRelationFieldMetadataItems,
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
