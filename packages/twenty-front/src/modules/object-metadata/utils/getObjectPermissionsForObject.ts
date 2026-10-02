import { type ObjectPermissionsByObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsByObjectMetadataId';
import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';

// An object missing from the role's permissions (e.g. created after they were loaded) is fully allowed; the server still enforces the real permissions
export const getObjectPermissionsForObject = (
  objectPermissionsByObjectMetadataId: ObjectPermissionsByObjectMetadataId,
  objectMetadataId: string,
): ObjectPermissionsWithObjectMetadataId =>
  objectPermissionsByObjectMetadataId[objectMetadataId] ?? {
    objectMetadataId,
    canReadObjectRecords: true,
    canUpdateObjectRecords: true,
    canSoftDeleteObjectRecords: true,
    canDestroyObjectRecords: true,
    restrictedFields: {},
    rowLevelPermissionPredicates: [],
    rowLevelPermissionPredicateGroups: [],
  };
