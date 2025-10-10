import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isImageIdentifierField } from '@/object-metadata/utils/isImageIdentifierField';

export const getImageIdentifierFieldMetadataItem = (
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'imageIdentifierFieldMetadataId' | 'nameSingular'
  >,
): FieldMetadataItem | undefined =>
  objectMetadataItem.fields.find((fieldMetadataItem) =>
    isImageIdentifierField({
      fieldMetadataItem,
      objectMetadataItem,
    }),
  );
