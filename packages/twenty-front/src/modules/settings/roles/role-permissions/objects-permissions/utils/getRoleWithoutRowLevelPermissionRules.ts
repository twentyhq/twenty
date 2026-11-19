import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';

export const getRoleWithoutRowLevelPermissionRules = ({
  role,
  ruleIds,
}: {
  role: RoleWithPartialMembers;
  ruleIds: string[];
}): RoleWithPartialMembers => {
  const isOfRemovedRule = ({
    rowLevelPermissionRuleId,
  }: {
    rowLevelPermissionRuleId?: string | null;
  }) =>
    isDefined(rowLevelPermissionRuleId) &&
    ruleIds.includes(rowLevelPermissionRuleId);

  const removedPredicateGroupIds = new Set(
    (role.rowLevelPermissionPredicateGroups ?? [])
      .filter(isOfRemovedRule)
      .map(({ id }) => id),
  );

  return {
    ...role,
    rowLevelPermissionRules: role.rowLevelPermissionRules?.filter(
      (rule) => !ruleIds.includes(rule.id),
    ),
    rowLevelPermissionPredicates: role.rowLevelPermissionPredicates?.filter(
      (predicate) => !isOfRemovedRule(predicate),
    ),
    rowLevelPermissionPredicateGroups:
      role.rowLevelPermissionPredicateGroups?.filter(
        (predicateGroup) => !removedPredicateGroupIds.has(predicateGroup.id),
      ),
    fieldPermissions: role.fieldPermissions?.filter(
      ({ rowLevelPermissionPredicateGroupId }) =>
        !isDefined(rowLevelPermissionPredicateGroupId) ||
        !removedPredicateGroupIds.has(rowLevelPermissionPredicateGroupId),
    ),
  };
};
