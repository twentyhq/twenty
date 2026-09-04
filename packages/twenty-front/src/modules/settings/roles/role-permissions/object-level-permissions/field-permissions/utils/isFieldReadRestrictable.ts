import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldUpdateRestrictable } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isFieldUpdateRestrictable';

export const isFieldReadRestrictable = ({
  fieldMetadataItem,
  labelIdentifierFieldMetadataId,
}: {
  fieldMetadataItem: FieldMetadataItem;
  labelIdentifierFieldMetadataId: string;
}) =>
  isFieldUpdateRestrictable(fieldMetadataItem) &&
  fieldMetadataItem.id !== labelIdentifierFieldMetadataId;
