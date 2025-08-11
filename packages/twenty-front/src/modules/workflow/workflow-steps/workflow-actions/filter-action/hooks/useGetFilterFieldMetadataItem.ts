import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isDefined } from 'twenty-shared/utils';

export const useGetFilterFieldMetadataItem = () => {
  const { objectMetadataItems } = useObjectMetadataItems();

  const getFilterFieldMetadataItem = (
    fieldMetadataId: string,
  ): {
    fieldMetadataItem: FieldMetadataItem | undefined;
    objectMetadataItem: ObjectMetadataItem | undefined;
  } => {
    for (const objectMetadataItem of objectMetadataItems) {
      const field = objectMetadataItem.fields.find(
        (field) => field.id === fieldMetadataId,
      );
      if (isDefined(field)) {
        return {
          fieldMetadataItem: field,
          objectMetadataItem: objectMetadataItem,
        };
      }
    }
    return {
      fieldMetadataItem: undefined,
      objectMetadataItem: undefined,
    };
  };

  return {
    getFilterFieldMetadataItem,
  };
};
