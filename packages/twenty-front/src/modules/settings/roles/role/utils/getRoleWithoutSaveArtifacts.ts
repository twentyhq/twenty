import { getRowLevelPermissionObjectMetadataIds } from '@/settings/roles/role/utils/getRowLevelPermissionObjectMetadataIds';
import { resolveSettingsRoleObjectRecordsGrant } from '@/settings/roles/role/utils/resolveSettingsRoleObjectRecordsGrant';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { sortByProperty } from '~/utils/array/sortByProperty';

// A save rewrites how grants are stored (derived rules, inherited values), so roles are compared on what they grant
export const getRoleWithoutSaveArtifacts = (
  role: RoleWithPartialMembers,
): RoleWithPartialMembers => {
  const ruleObjectMetadataIds = [
    ...getRowLevelPermissionObjectMetadataIds(role),
  ];

  const objectPermissionsOfObjectsWithoutRule = (
    role.objectPermissions ?? []
  ).filter(
    ({ objectMetadataId }) => !ruleObjectMetadataIds.includes(objectMetadataId),
  );

  const objectPermissionsOfObjectsWithRule = ruleObjectMetadataIds.map(
    (objectMetadataId) => {
      const grant = resolveSettingsRoleObjectRecordsGrant({
        role,
        objectMetadataId,
      });

      return {
        objectMetadataId,
        canReadObjectRecords: grant.canReadRecords,
        canUpdateObjectRecords: grant.canUpdateRecords,
        canSoftDeleteObjectRecords: grant.canSoftDeleteRecords,
        canDestroyObjectRecords: grant.canDestroyRecords,
      };
    },
  );

  return {
    ...role,
    rowLevelPermissionRules: undefined,
    rowLevelPermissionPredicates: role.rowLevelPermissionPredicates?.map(
      (predicate) => ({
        ...predicate,
        relationFieldMetadataId: predicate.relationFieldMetadataId ?? null,
      }),
    ),
    objectPermissions: [
      ...objectPermissionsOfObjectsWithoutRule,
      ...objectPermissionsOfObjectsWithRule,
    ].sort(sortByProperty('objectMetadataId')),
  };
};
