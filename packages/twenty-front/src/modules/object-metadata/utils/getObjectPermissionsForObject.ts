import { getObjectPermissionsFromMapByObjectMetadataId } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectPermissionsFromMapByObjectMetadataId';
import { type ObjectPermissions } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const getObjectPermissionsForObject = (
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >,
  objectMetadataId: string,
): ObjectPermissions & { objectMetadataId: string } => {
  const objectPermissions = getObjectPermissionsFromMapByObjectMetadataId({
    objectPermissionsByObjectMetadataId,
    objectMetadataId,
  });

  if (!isDefined(objectPermissions)) {
    return {
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
      restrictedFields: {},
      objectMetadataId,
    };
  }

  return {
    canReadObjectRecords: objectPermissions.canReadObjectRecords ?? true,
    canUpdateObjectRecords: objectPermissions.canUpdateObjectRecords ?? true,
    canSoftDeleteObjectRecords:
      objectPermissions.canSoftDeleteObjectRecords ?? true,
    canDestroyObjectRecords: objectPermissions.canDestroyObjectRecords ?? true,
    restrictedFields: objectPermissions.restrictedFields ?? {},
    objectMetadataId,
  };
};
