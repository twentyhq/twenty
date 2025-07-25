import { isDefined } from 'twenty-shared/utils';
import { ObjectPermissionsWithRestrictedFields } from '~/generated/graphql';

export const getObjectPermissionsForObject = (
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissionsWithRestrictedFields
  >,
  objectMetadataId: string,
): ObjectPermissionsWithRestrictedFields => {
  const objectPermissions =
    objectPermissionsByObjectMetadataId[objectMetadataId];

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
