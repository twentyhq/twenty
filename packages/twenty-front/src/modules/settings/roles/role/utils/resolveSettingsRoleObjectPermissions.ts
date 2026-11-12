import { getRowLevelPermissionObjectMetadataIds } from '@/settings/roles/role/utils/getRowLevelPermissionObjectMetadataIds';
import { resolveSettingsRoleObjectRecordsGrant } from '@/settings/roles/role/utils/resolveSettingsRoleObjectRecordsGrant';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { sortByProperty } from '~/utils/array/sortByProperty';

export const resolveSettingsRoleObjectPermissions = (
  role: RoleWithPartialMembers,
) => {
  const rowLevelPermissionObjectMetadataIds =
    getRowLevelPermissionObjectMetadataIds(role);

  const objectPermissionsWithoutRowLevelPermission = (
    role.objectPermissions ?? []
  ).filter(
    ({ objectMetadataId }) =>
      !rowLevelPermissionObjectMetadataIds.has(objectMetadataId),
  );

  const objectPermissionsWithRowLevelPermission = [
    ...rowLevelPermissionObjectMetadataIds,
  ].map((objectMetadataId) => {
    const objectRecordsGrant = resolveSettingsRoleObjectRecordsGrant({
      role,
      objectMetadataId,
    });

    return {
      objectMetadataId,
      canReadObjectRecords: objectRecordsGrant.canReadRecords,
      canUpdateObjectRecords: objectRecordsGrant.canUpdateRecords,
      canSoftDeleteObjectRecords: objectRecordsGrant.canSoftDeleteRecords,
      canDestroyObjectRecords: objectRecordsGrant.canDestroyRecords,
    };
  });

  return [
    ...objectPermissionsWithoutRowLevelPermission,
    ...objectPermissionsWithRowLevelPermission,
  ].sort(sortByProperty('objectMetadataId'));
};
