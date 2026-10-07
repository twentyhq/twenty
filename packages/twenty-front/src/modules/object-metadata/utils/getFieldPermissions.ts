import { type ObjectPermissions } from 'twenty-shared/types';

type GetFieldPermissionsArgs = {
  objectPermissions: Pick<ObjectPermissions, 'restrictedFields'>;
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
