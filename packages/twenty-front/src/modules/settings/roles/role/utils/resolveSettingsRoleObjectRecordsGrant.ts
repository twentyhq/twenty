import { type Role } from '~/generated-metadata/graphql';

export const resolveSettingsRoleObjectRecordsGrant = ({
  role,
  objectMetadataId,
}: {
  role: Pick<
    Role,
    | 'objectPermissions'
    | 'canReadAllObjectRecords'
    | 'canUpdateAllObjectRecords'
    | 'canSoftDeleteAllObjectRecords'
    | 'canDestroyAllObjectRecords'
  >;
  objectMetadataId: string;
}) => {
  const objectPermission = role.objectPermissions?.find(
    (rolePermission) => rolePermission.objectMetadataId === objectMetadataId,
  );
  const canUpdateRecords =
    objectPermission?.canUpdateObjectRecords ?? role.canUpdateAllObjectRecords;

  return {
    canCreateRecords: canUpdateRecords,
    canReadRecords:
      objectPermission?.canReadObjectRecords ?? role.canReadAllObjectRecords,
    canUpdateRecords,
    canSoftDeleteRecords:
      objectPermission?.canSoftDeleteObjectRecords ??
      role.canSoftDeleteAllObjectRecords,
    canDestroyRecords:
      objectPermission?.canDestroyObjectRecords ??
      role.canDestroyAllObjectRecords,
  };
};
