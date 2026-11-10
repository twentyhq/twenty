import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

// An object filtered by row level rules keeps its object-level grant off, so its toggles show its rule grants
export const withRowLevelPermissionRuleGrants = (
  role: RoleWithPartialMembers,
): RoleWithPartialMembers => {
  const rules = role.rowLevelPermissionRules ?? [];

  if (rules.length === 0) {
    return role;
  }

  const objectPermissions = [...(role.objectPermissions ?? [])];

  for (const rule of rules) {
    const objectPermissionIndex = objectPermissions.findIndex(
      ({ objectMetadataId }) => objectMetadataId === rule.objectMetadataId,
    );
    // A grant equal to the all-objects one stays inherited, so it keeps following that toggle
    const inheritWhenEqual = (ruleGrant: boolean, allObjectsGrant: boolean) =>
      ruleGrant === allObjectsGrant ? null : ruleGrant;
    const ruleGrants = {
      objectMetadataId: rule.objectMetadataId,
      canReadObjectRecords: inheritWhenEqual(
        rule.canReadRecords,
        role.canReadAllObjectRecords,
      ),
      canUpdateObjectRecords: inheritWhenEqual(
        rule.canUpdateRecords,
        role.canUpdateAllObjectRecords,
      ),
      canSoftDeleteObjectRecords: inheritWhenEqual(
        rule.canSoftDeleteRecords,
        role.canSoftDeleteAllObjectRecords,
      ),
      canDestroyObjectRecords: inheritWhenEqual(
        rule.canDestroyRecords,
        role.canDestroyAllObjectRecords,
      ),
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
