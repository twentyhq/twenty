import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { filterUserFacingFieldMetadataItems } from '@/object-metadata/utils/filterUserFacingFieldMetadataItems';

// Fields the UI never lets a user edit (createdAt, deletedAt...) are also the ones
// the app relies on to render records, so a role must not be able to restrict them
export const isFieldUpdateRestrictable = (
  fieldMetadataItem: FieldMetadataItem,
) =>
  filterUserFacingFieldMetadataItems(fieldMetadataItem) &&
  (fieldMetadataItem.isUIEditable ?? true);
