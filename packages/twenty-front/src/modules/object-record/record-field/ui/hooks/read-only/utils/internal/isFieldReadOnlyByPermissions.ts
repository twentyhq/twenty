import { isObjectReadOnly } from '@/object-record/record-field/ui/hooks/read-only/utils/isObjectReadOnly';
import { type ObjectPermission } from '~/generated/graphql';

export type IsFieldReadOnlyByPermissionParams = {
  objectPermissions: ObjectPermission;
  fieldMetadataId: string;
};

export const isFieldReadOnlyByPermissions = ({
  objectPermissions,
  fieldMetadataId,
}: IsFieldReadOnlyByPermissionParams) => {
  if (isObjectReadOnly({ objectPermissions }) === true) {
    return true;
  }

  const fieldMetadataIsRestrictedForUpdate =
    objectPermissions.restrictedFields[fieldMetadataId]?.canUpdate === false;

  return fieldMetadataIsRestrictedForUpdate;
};
