import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

export const filterUserFacingFieldMetadataItems = (
  field: FieldMetadataItem,
) => {
  return !isHiddenSystemField(field);
};
