import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { View } from '@/views/types/View';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useFavoritesMetadata = () => {
  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();

  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });

  const favoriteRelationFields = favoriteObjectMetadataItem.fields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.Relation &&
      fieldMetadataItem.name !== 'workspaceMember' &&
      fieldMetadataItem.name !== 'favoriteFolder',
  );

  return {
    views,
    objectMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    favoriteRelationFields,
  };
};
