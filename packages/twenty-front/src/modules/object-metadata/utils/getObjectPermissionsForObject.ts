import { ObjectPermissions } from '@/object-record/cache/types/ObjectPermissions';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';

export const getObjectPermissionsForObject = (
  objectPermissionsByObjectMetadataId: Record<string, ObjectPermission>,
  objectMetadataId: string,
): ObjectPermissions => {
  const objectPermissions =
    objectPermissionsByObjectMetadataId[objectMetadataId];

  if (!isDefined(objectPermissions)) {
    return {
      canReadObjectRecords: true,
      canUpdateObjectRecords: true,
      canSoftDeleteObjectRecords: true,
      canDestroyObjectRecords: true,
    };
  }

  return {
    canReadObjectRecords: objectPermissions.canReadObjectRecords ?? true,
    canUpdateObjectRecords: objectPermissions.canUpdateObjectRecords ?? true,
    canSoftDeleteObjectRecords:
      objectPermissions.canSoftDeleteObjectRecords ?? true,
    canDestroyObjectRecords: objectPermissions.canDestroyObjectRecords ?? true,
  };
};
