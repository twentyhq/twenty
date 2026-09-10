import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

// Neither flag identifies system-managed fields on its own: position and
// searchVector are hidden yet come back with isUIEditable true, while
// createdAt and deletedAt are visible with isUIEditable false.
export const isFieldRestrictable = (fieldMetadataItem: FieldMetadataItem) =>
  !isHiddenSystemField(fieldMetadataItem) &&
  (fieldMetadataItem.isUIEditable ?? true);
