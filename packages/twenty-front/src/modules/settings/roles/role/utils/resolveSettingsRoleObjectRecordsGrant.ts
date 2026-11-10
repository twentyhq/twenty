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
  return {
    canReadRecords:
      objectPermission?.canReadObjectRecords ?? role.canReadAllObjectRecords,
    canUpdateRecords:
      objectPermission?.canUpdateObjectRecords ??
      role.canUpdateAllObjectRecords,
    canSoftDeleteRecords:
      objectPermission?.canSoftDeleteObjectRecords ??
      role.canSoftDeleteAllObjectRecords,
    canDestroyRecords:
      objectPermission?.canDestroyObjectRecords ??
      role.canDestroyAllObjectRecords,
  };
};
