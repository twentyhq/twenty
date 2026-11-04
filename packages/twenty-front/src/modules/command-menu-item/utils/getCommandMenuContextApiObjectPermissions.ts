import { type ObjectRecordsPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectRecordsPermissionsWithObjectMetadataId';
import { type CommandMenuContextApi } from 'twenty-shared/types';

// Stored conditional availability expressions read the legacy permission names
export const getCommandMenuContextApiObjectPermissions = ({
  objectPermissions,
}: {
  objectPermissions: ObjectRecordsPermissionsWithObjectMetadataId;
}): CommandMenuContextApi['objectPermissions'] => ({
  objectMetadataId: objectPermissions.objectMetadataId,
  canReadObjectRecords: objectPermissions.canReadSomeRecords,
  canUpdateObjectRecords: objectPermissions.canUpdateSomeRecords,
  canSoftDeleteObjectRecords: objectPermissions.canSoftDeleteSomeRecords,
  canDestroyObjectRecords: objectPermissions.canDestroySomeRecords,
  restrictedFields: objectPermissions.restrictedFields,
  rowLevelPermissionPredicates:
    objectPermissions.rowLevelRecordsPermissions?.predicates ?? [],
  rowLevelPermissionPredicateGroups:
    objectPermissions.rowLevelRecordsPermissions?.predicateGroups ?? [],
});
