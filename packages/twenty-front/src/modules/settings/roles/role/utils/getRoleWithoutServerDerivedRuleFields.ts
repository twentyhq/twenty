import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { sortByProperty } from '~/utils/array/sortByProperty';

// The server derives rules and their ids, and syncing a rule edit reorders these lists
export const getRoleWithoutServerDerivedRuleFields = (
  role: RoleWithPartialMembers,
): RoleWithPartialMembers => ({
  ...role,
  rowLevelPermissionRules: undefined,
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
