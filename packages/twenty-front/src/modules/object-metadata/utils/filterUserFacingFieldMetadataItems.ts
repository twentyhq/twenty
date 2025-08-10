import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const filterUserFacingFieldMetadataItems = (
  field: FieldMetadataItem,
) => {
  return !field.isSystem;
};
