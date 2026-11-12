import { SETTINGS_ROLE_OBJECT_PERMISSION_KEYS } from '@/settings/roles/role-permissions/objects-permissions/constants/SettingsRoleObjectPermissionKeys';
import { isDefined } from 'twenty-shared/utils';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { sortByProperty } from '~/utils/array/sortByProperty';

// The server derives rules and their ids, and syncing a rule edit reorders these lists
export const getRoleWithoutServerDerivedRuleFields = (
  role: RoleWithPartialMembers,
): RoleWithPartialMembers => ({
  ...role,
  rowLevelPermissionRules: undefined,
  objectPermissions: role.objectPermissions
    ?.filter((objectPermission) =>
      SETTINGS_ROLE_OBJECT_PERMISSION_KEYS.some((key) =>
        isDefined(objectPermission[key]),
      ),
    )
    .sort(sortByProperty('objectMetadataId')),
  rowLevelPermissionFieldPermissions: undefined,
  rowLevelPermissionPredicates: role.rowLevelPermissionPredicates
    ?.map(({ rowLevelPermissionRuleId: _ruleId, ...predicate }) => ({
      ...predicate,
      relationFieldMetadataId: predicate.relationFieldMetadataId ?? null,
    }))
    .sort(sortByProperty('id')),
  rowLevelPermissionPredicateGroups: role.rowLevelPermissionPredicateGroups
    ?.map(
      ({ rowLevelPermissionRuleId: _ruleId, ...predicateGroup }) =>
        predicateGroup,
    )
    .sort(sortByProperty('id')),
});
