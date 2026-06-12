import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isImageIdentifierField } from '@/object-metadata/utils/isImageIdentifierField';

export const getImageIdentifierFieldMetadataItem = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'imageIdentifierFieldMetadataId' | 'nameSingular'
  >,
): FieldMetadataItem | undefined =>
  objectMetadataItem.fields.find((fieldMetadataItem) =>
    isImageIdentifierField({
      fieldMetadataItem,
      objectMetadataItem,
    }),
  );
