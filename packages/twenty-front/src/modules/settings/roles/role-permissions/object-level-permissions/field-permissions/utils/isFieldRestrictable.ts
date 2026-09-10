import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';

export const isFieldRestrictable = (fieldMetadataItem: FieldMetadataItem) =>
  filterUserFacingFieldMetadataItems(fieldMetadataItem) &&
  (fieldMetadataItem.isUIEditable ?? true);
