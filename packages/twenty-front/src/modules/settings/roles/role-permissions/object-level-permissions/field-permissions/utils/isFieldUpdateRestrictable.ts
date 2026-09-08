import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';

export const isFieldUpdateRestrictable = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  filterUserFacingFieldMetadataItems(fieldMetadataItem) &&
  (fieldMetadataItem.isUIEditable ?? true);
