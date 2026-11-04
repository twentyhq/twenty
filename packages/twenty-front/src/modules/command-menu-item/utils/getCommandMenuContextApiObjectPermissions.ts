import {
  type CommandMenuContextApi,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';
import { canReachSomeRecords } from 'twenty-shared/utils';

// Stored conditional availability expressions read the legacy permission names
export const getCommandMenuContextApiObjectPermissions = ({
  objectMetadataId,
  objectRecordsPermissions,
}: {
  objectMetadataId: string;
  objectRecordsPermissions: ObjectRecordsPermissions;
}): CommandMenuContextApi['objectPermissions'] => ({
  objectMetadataId,
  canReadObjectRecords: canReachSomeRecords({
    objectRecordsPermissions,
    operationType: 'select',
  }),
  canUpdateObjectRecords: canReachSomeRecords({
    objectRecordsPermissions,
    operationType: 'update',
  }),
  canSoftDeleteObjectRecords: canReachSomeRecords({
    objectRecordsPermissions,
    operationType: 'soft-delete',
  }),
  canDestroyObjectRecords: canReachSomeRecords({
    objectRecordsPermissions,
    operationType: 'delete',
  }),
  restrictedFields: objectRecordsPermissions.restrictedFields,
  rowLevelPermissionPredicates:
    objectRecordsPermissions.rowLevelRecordsPermissions?.predicates ?? [],
  rowLevelPermissionPredicateGroups:
    objectRecordsPermissions.rowLevelRecordsPermissions?.predicateGroups ?? [],
});
