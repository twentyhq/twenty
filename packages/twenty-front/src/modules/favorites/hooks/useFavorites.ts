import { favoriteViewsWithMinimalDataSelector } from '@/favorites/states/selectors/favoriteViewsWithMinimalDataSelector';
import { sortFavorites } from '@/favorites/utils/sortFavorites';
import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useMemo } from 'react';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';
import { usePrefetchedFavoritesData } from './usePrefetchedFavoritesData';

export const useFavorites = () => {
  const { favorites } = usePrefetchedFavoritesData();
  const favoriteViewsWithMinimalData = useRecoilValue(
    favoriteViewsWithMinimalDataSelector,
  );
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();

  const favoriteRelationFieldMetadataItems = useMemo(
    () =>
      favoriteObjectMetadataItem.readableFields.filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.type === FieldMetadataType.RELATION &&
          fieldMetadataItem.name !== 'forWorkspaceMember' &&
          fieldMetadataItem.name !== 'favoriteFolder',
      ),
    [favoriteObjectMetadataItem.readableFields],
  );

  const sortedFavorites = useMemo(
    () =>
      sortFavorites(
        favorites,
        favoriteRelationFieldMetadataItems,
        getObjectRecordIdentifierByNameSingular,
        true,
        favoriteViewsWithMinimalData,
        objectMetadataItems,
      ),
    [
      favorites,
      favoriteRelationFieldMetadataItems,
      getObjectRecordIdentifierByNameSingular,
      favoriteViewsWithMinimalData,
      objectMetadataItems,
    ],
  );

  return { sortedFavorites };
};
