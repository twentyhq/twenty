import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';

export const DEFAULT_LABEL_IDENTIFIER_FIELD_NAME = 'name';

export const isLabelIdentifierField = ({
  fieldMetadataItem,
  objectMetadataItem,
}: {
  fieldMetadataItem: FieldMetadataItem;
  objectMetadataItem: ObjectMetadataItem;
}) => {
  return (
    fieldMetadataItem.id ===
      objectMetadataItem.labelIdentifierFieldMetadataId ||
    fieldMetadataItem.name === DEFAULT_LABEL_IDENTIFIER_FIELD_NAME
  );
};
