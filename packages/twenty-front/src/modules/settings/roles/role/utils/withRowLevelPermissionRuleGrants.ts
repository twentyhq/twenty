import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

// An object filtered by row level rules keeps its object-level grant off, so its toggles show its rule grants
export const withRowLevelPermissionRuleGrants = (
  role: RoleWithPartialMembers,
): RoleWithPartialMembers => {
  const filteredObjectMetadataIds = new Set(
    (role.rowLevelPermissionPredicates ?? []).map(
      ({ objectMetadataId }) => objectMetadataId,
    ),
  );
  const rules = (role.rowLevelPermissionRules ?? []).filter(
    ({ objectMetadataId }) => filteredObjectMetadataIds.has(objectMetadataId),
  );

  if (rules.length === 0) {
    return role;
  }

  const objectPermissions = [...(role.objectPermissions ?? [])];

  for (const rule of rules) {
    const objectPermissionIndex = objectPermissions.findIndex(
      ({ objectMetadataId }) => objectMetadataId === rule.objectMetadataId,
    );
    // A grant equal to the all-objects one stays inherited, so it keeps following that toggle
    const inheritWhenEqual = ({
      ruleGrant,
      allObjectsGrant,
    }: {
      ruleGrant: boolean;
      allObjectsGrant: boolean;
    }) => (ruleGrant === allObjectsGrant ? null : ruleGrant);
    const ruleGrants = {
      objectMetadataId: rule.objectMetadataId,
      canReadObjectRecords: inheritWhenEqual({
        ruleGrant: rule.canReadRecords,
        allObjectsGrant: role.canReadAllObjectRecords,
      }),
      canUpdateObjectRecords: inheritWhenEqual({
        ruleGrant: rule.canUpdateRecords,
        allObjectsGrant: role.canUpdateAllObjectRecords,
      }),
      canSoftDeleteObjectRecords: inheritWhenEqual({
        ruleGrant: rule.canSoftDeleteRecords,
        allObjectsGrant: role.canSoftDeleteAllObjectRecords,
      }),
      canDestroyObjectRecords: inheritWhenEqual({
        ruleGrant: rule.canDestroyRecords,
        allObjectsGrant: role.canDestroyAllObjectRecords,
      }),
    };

    if (objectPermissionIndex === -1) {
      objectPermissions.push(ruleGrants);
    } else if (isDefined(objectPermissions[objectPermissionIndex])) {
      objectPermissions[objectPermissionIndex] = {
        ...objectPermissions[objectPermissionIndex],
        ...ruleGrants,
      };
    }
  }

  return { ...role, objectPermissions };
};
