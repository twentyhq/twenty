import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';

// Anything the role does not specify is allowed; the server still enforces the real permissions
export const getDefaultObjectPermissions = (
  objectMetadataId: string,
): ObjectPermissionsWithObjectMetadataId => ({
  objectMetadataId,
  canReadObjectRecords: true,
  canUpdateObjectRecords: true,
  canSoftDeleteObjectRecords: true,
  canDestroyObjectRecords: true,
  restrictedFields: {},
  rowLevelPermissionPredicates: [],
  rowLevelPermissionPredicateGroups: [],
});
