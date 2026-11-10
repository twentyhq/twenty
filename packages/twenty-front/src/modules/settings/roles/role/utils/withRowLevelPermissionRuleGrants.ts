import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

// An object filtered by row level rules keeps its object-level grant off, so its toggles show what its rules grant
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
    const ruleGrants = {
      objectMetadataId: rule.objectMetadataId,
      canReadObjectRecords: rule.canReadRecords,
      canUpdateObjectRecords: rule.canUpdateRecords,
      canSoftDeleteObjectRecords: rule.canSoftDeleteRecords,
      canDestroyObjectRecords: rule.canDestroyRecords,
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
