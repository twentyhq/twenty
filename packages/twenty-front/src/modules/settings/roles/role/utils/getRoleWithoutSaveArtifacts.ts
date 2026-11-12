import { getGrantedObjectPermissionKeys } from '@/settings/roles/role-permissions/objects-permissions/utils/getGrantedObjectPermissionKeys';
import { getObjectRowLevelPermissionPredicates } from '@/settings/roles/role-permissions/objects-permissions/utils/getObjectRowLevelPermissionPredicates';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';

// Saving a rule makes the server derive its rule list and rewrite the object's grants,
// so a role is compared on what it grants, not on how the draft happened to store it
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
    ({ objectMetadataId }) => !ruleObjectMetadataIds.includes(objectMetadataId),
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
