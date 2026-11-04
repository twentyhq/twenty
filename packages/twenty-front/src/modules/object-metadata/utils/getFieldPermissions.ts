import { type ObjectRecordsPermissions } from 'twenty-shared/types';

type GetFieldPermissionsArgs = {
  objectPermissions: Pick<ObjectRecordsPermissions, 'restrictedFields'>;
  fieldMetadataId: string;
};

export const getFieldPermissions = ({
  objectPermissions,
  fieldMetadataId,
}: GetFieldPermissionsArgs) => {
  const restrictedField = objectPermissions.restrictedFields[fieldMetadataId];

  return {
    canReadField: restrictedField?.canRead !== false,
    canUpdateField: restrictedField?.canUpdate !== false,
  };
};
