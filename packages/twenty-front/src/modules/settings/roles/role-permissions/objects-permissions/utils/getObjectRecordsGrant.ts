import { isDefined } from 'twenty-shared/utils';
import { type Role } from '~/generated-metadata/graphql';

export const getObjectRecordsGrant = ({
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
  objectMetadataId?: string;
}) => {
  const objectPermission = isDefined(objectMetadataId)
    ? role.objectPermissions?.find(
        (rolePermission) =>
          rolePermission.objectMetadataId === objectMetadataId,
      )
    : undefined;

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
