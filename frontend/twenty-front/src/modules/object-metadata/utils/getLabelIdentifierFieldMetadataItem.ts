import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';

export const getLabelIdentifierFieldMetadataItem = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'fields' | 'labelIdentifierFieldMetadataId'
  >,
): FieldMetadataItem | undefined =>
  objectMetadataItem.fields.find((fieldMetadataItem) =>
    isLabelIdentifierField({
      fieldMetadataItem,
      objectMetadataItem,
    }),
  );
