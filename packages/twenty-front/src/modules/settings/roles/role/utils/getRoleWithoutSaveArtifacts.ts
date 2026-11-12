import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { isDefined } from 'twenty-shared/utils';
import { getGrantedObjectPermissionKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getGrantedObjectPermissionKeys';
import { getObjectRowLevelPermissionPredicates } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectRowLevelPermissionPredicates';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

// A save rewrites how grants are stored (derived rules, inherited values), so roles are compared on what they grant
export const getRoleWithoutSaveArtifacts = (
  role: RoleWithPartialMembers,
): RoleWithPartialMembers => {
  const ruleObjectMetadataIds = [
    ...new Set(
      (role.rowLevelPermissionPredicates ?? []).map(
        ({ objectMetadataId }) => objectMetadataId,
      ),
    ),
  ].filter(
    (objectMetadataId) =>
      getObjectRowLevelPermissionPredicates({ role, objectMetadataId }).length >
      0,
  );

  const objectPermissionsOfObjectsWithoutRule = (
    role.objectPermissions ?? []
  ).filter(
    (objectPermission) =>
      !ruleObjectMetadataIds.includes(objectPermission.objectMetadataId) &&
      SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.some((key) =>
        isDefined(objectPermission[key]),
      ),
  );

  const objectPermissionsOfObjectsWithRule = ruleObjectMetadataIds
    .toSorted()
    .map((objectMetadataId) => {
      const grantedKeys = getGrantedObjectPermissionKeys({
        role,
        objectMetadataId,
      });

      return {
        objectMetadataId,
        canReadObjectRecords: grantedKeys.includes('canReadObjectRecords'),
        canUpdateObjectRecords: grantedKeys.includes('canUpdateObjectRecords'),
        canSoftDeleteObjectRecords: grantedKeys.includes(
          'canSoftDeleteObjectRecords',
        ),
        canDestroyObjectRecords: grantedKeys.includes(
          'canDestroyObjectRecords',
        ),
      };
    });

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
    ],
  };
};
