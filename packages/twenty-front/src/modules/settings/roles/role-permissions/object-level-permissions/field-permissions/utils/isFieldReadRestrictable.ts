import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isHiddenSystemField } from '@/object-metadata/utils/isHiddenSystemField';

// The soft delete filter selects deletedAt on every read, so restricting it
// denies the role every record of the object.
const NON_READ_RESTRICTABLE_FIELD_NAMES = new Set(['deletedAt']);

export const isFieldReadRestrictable = ({
  fieldMetadataItem,
  labelIdentifierFieldMetadataId,
}: {
  fieldMetadataItem: FieldMetadataItem;
  labelIdentifierFieldMetadataId: string;
}) =>
  !isHiddenSystemField(fieldMetadataItem) &&
  !NON_READ_RESTRICTABLE_FIELD_NAMES.has(fieldMetadataItem.name) &&
  fieldMetadataItem.id !== labelIdentifierFieldMetadataId;
