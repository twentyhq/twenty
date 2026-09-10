import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { isFieldRestrictable } from '@/settings/roles/role-permissions/object-level-permissions/field-permissions/utils/isFieldRestrictable';

export const isFieldReadRestrictable = ({
  fieldMetadataItem,
  labelIdentifierFieldMetadataId,
}: {
  fieldMetadataItem: FieldMetadataItem;
  labelIdentifierFieldMetadataId: string;
}) =>
  isFieldRestrictable(fieldMetadataItem) &&
  fieldMetadataItem.id !== labelIdentifierFieldMetadataId;
