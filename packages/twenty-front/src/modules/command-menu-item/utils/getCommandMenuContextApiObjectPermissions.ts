import {
  type CommandMenuContextApi,
  type ObjectRecordsPermissions,
} from 'twenty-shared/types';
import { canAccessThroughAllRecordsOrRlsPermission } from 'twenty-shared/utils';

// Stored conditional availability expressions read the legacy permission names
export const getCommandMenuContextApiObjectPermissions = ({
  objectMetadataId,
  objectRecordsPermissions,
}: {
  objectMetadataId: string;
  objectRecordsPermissions: ObjectRecordsPermissions;
}): CommandMenuContextApi['objectPermissions'] => ({
  objectMetadataId,
  canCreateObjectRecords: canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions,
    operationType: 'create',
  }),
  canReadObjectRecords: canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions,
    operationType: 'read',
  }),
  canUpdateObjectRecords: canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions,
    operationType: 'update',
  }),
  canSoftDeleteObjectRecords: canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions,
    operationType: 'softDelete',
  }),
  canDestroyObjectRecords: canAccessThroughAllRecordsOrRlsPermission({
    objectRecordsPermissions,
    operationType: 'destroy',
  }),
  unreadableFields: objectRecordsPermissions.unreadableFields,
  uneditableFields: objectRecordsPermissions.uneditableFields,
  rowLevelPermissionPredicates: (
    objectRecordsPermissions.rowLevelRecordsPermissions ?? []
  ).flatMap(({ predicates }) => predicates),
  rowLevelPermissionPredicateGroups: (
    objectRecordsPermissions.rowLevelRecordsPermissions ?? []
  ).flatMap(({ predicateGroups }) => predicateGroups),
});
