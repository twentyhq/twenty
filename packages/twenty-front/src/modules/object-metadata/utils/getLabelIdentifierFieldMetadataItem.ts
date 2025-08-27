import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isLabelIdentifierField } from '@/object-metadata/utils/isLabelIdentifierField';

export const getLabelIdentifierFieldMetadataItem = (
  objectMetadataItem: Pick<
    ObjectMetadataItem,
    'fields' | 'labelIdentifierFieldMetadataId'
  >,
): FieldMetadataItem | undefined =>
  objectMetadataItem.fields.find((fieldMetadataItem) =>
    isLabelIdentifierField({
      fieldMetadataItem,
      objectMetadataItem,
    }),
  );
