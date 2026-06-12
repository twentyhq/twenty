import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

export const filterFieldsForRecordTableViewCreation = (
  field: FieldMetadataItem,
) => {
  return field.isActive && !field.isSystem && !isHiddenSystemField(field);
};
