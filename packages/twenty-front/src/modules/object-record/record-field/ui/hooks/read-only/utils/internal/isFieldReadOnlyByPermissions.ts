import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { isObjectReadOnly } from '@/object-record/record-field/ui/hooks/read-only/utils/isObjectReadOnly';
import { type ObjectPermission } from '~/generated/graphql';

export type IsFieldReadOnlyByPermissionParams = {
  objectPermissions: ObjectPermission;
  objectMetadataItem: ObjectMetadataItem;
  fieldMetadataItem: FieldMetadataItem;
};

export const isFieldReadOnlyByPermissions = ({
  objectPermissions,
  objectMetadataItem,
  fieldMetadataItem,
}: IsFieldReadOnlyByPermissionParams) => {
  if (isObjectReadOnly({ objectPermissions, objectMetadataItem }) === true) {
    return true;
  }

  const fieldMetadataIsRestrictedForUpdate =
    objectPermissions.restrictedFields[fieldMetadataItem?.id]?.canUpdate ===
    false;

  return fieldMetadataIsRestrictedForUpdate;
};
