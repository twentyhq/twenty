import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';

// Anything the role does not specify is allowed; the server still enforces the real permissions
export const getDefaultObjectPermissions = (
  objectMetadataId: string,
): ObjectRecordsPermissionsWithObjectMetadataId => ({
  objectMetadataId,
  canReadAllRecords: true,
  canUpdateAllRecords: true,
  canSoftDeleteAllRecords: true,
  canDestroyAllRecords: true,
  canReadSomeRecords: true,
  canUpdateSomeRecords: true,
  canSoftDeleteSomeRecords: true,
  canDestroySomeRecords: true,
  restrictedFields: {},
  rowLevelRecordsPermissions: null,
});
