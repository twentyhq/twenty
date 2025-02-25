import { useGetObjectRecordIdentifierByNameSingular } from '@/object-metadata/hooks/useGetObjectRecordIdentifierByNameSingular';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useRecoilValue } from 'recoil';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useFavoritesMetadata = () => {
  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const getObjectRecordIdentifierByNameSingular =
    useGetObjectRecordIdentifierByNameSingular();

  const { objectMetadataItem: favoriteObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Favorite,
    });

  const favoriteRelationFields = favoriteObjectMetadataItem.fields.filter(
    (fieldMetadataItem) =>
      fieldMetadataItem.type === FieldMetadataType.RELATION &&
      fieldMetadataItem.name !== 'forWorkspaceMember' &&
      fieldMetadataItem.name !== 'favoriteFolder',
  );

  return {
    objectMetadataItems,
    getObjectRecordIdentifierByNameSingular,
    favoriteRelationFields,
  };
};
