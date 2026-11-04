import { type CurrentUserWorkspaceObjectRecordsPermissions } from '@/auth/types/CurrentUserWorkspaceObjectRecordsPermissions';
import { type ObjectPermissionsWithObjectMetadataId } from '@/object-metadata/types/ObjectPermissionsWithObjectMetadataId';

export const getObjectPermissionsFromObjectRecordsPermissions = ({
  objectRecordsPermissions,
}: {
  objectRecordsPermissions: CurrentUserWorkspaceObjectRecordsPermissions;
}): ObjectPermissionsWithObjectMetadataId => {
  const rowLevelRecordsPermissions =
    objectRecordsPermissions.rowLevelRecordsPermissions;

  return {
    objectMetadataId: objectRecordsPermissions.objectMetadataId,
    canReadObjectRecords:
      objectRecordsPermissions.canReadAllRecords ||
      (rowLevelRecordsPermissions?.canReadRecords ?? false),
    canUpdateObjectRecords:
      objectRecordsPermissions.canUpdateAllRecords ||
      (rowLevelRecordsPermissions?.canUpdateRecords ?? false),
    canSoftDeleteObjectRecords:
      objectRecordsPermissions.canSoftDeleteAllRecords ||
      (rowLevelRecordsPermissions?.canSoftDeleteRecords ?? false),
    canDestroyObjectRecords:
      objectRecordsPermissions.canDestroyAllRecords ||
      (rowLevelRecordsPermissions?.canDestroyRecords ?? false),
    restrictedFields: objectRecordsPermissions.restrictedFields,
    rowLevelPermissionPredicates: rowLevelRecordsPermissions?.predicates ?? [],
    rowLevelPermissionPredicateGroups:
      rowLevelRecordsPermissions?.predicateGroups ?? [],
  };
};
