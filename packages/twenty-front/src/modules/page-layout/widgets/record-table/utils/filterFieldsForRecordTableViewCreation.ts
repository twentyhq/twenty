import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

export const filterFieldsForRecordTableViewCreation = (
  field: FieldMetadataItem,
  labelIdentifierFieldMetadataId: string,
) => {
  const isLabelIdentifier = field.id === labelIdentifierFieldMetadataId;
  return (
    field.isActive &&
    (isLabelIdentifier || (!field.isSystem && !isHiddenSystemField(field)))
  );
};
