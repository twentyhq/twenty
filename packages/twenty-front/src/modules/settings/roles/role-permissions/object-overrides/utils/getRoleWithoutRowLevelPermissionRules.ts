import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import {
  type FieldPermission,
  type RowLevelPermissionRule,
} from '~/generated-metadata/graphql';

export const getRoleWithoutRowLevelPermissionRules = ({
  role,
  shouldRemoveRule,
}: {
  role: RoleWithPartialMembers;
  shouldRemoveRule: (rule: RowLevelPermissionRule) => boolean;
}): RoleWithPartialMembers => {
  const rowLevelPermissionRuleIds = (role.rowLevelPermissionRules ?? [])
    .filter(shouldRemoveRule)
    .map(({ id }) => id);

  const isOfRemovedRule = ({
    rowLevelPermissionRuleId,
  }: {
    rowLevelPermissionRuleId?: string | null;
  }) =>
    isDefined(rowLevelPermissionRuleId) &&
    rowLevelPermissionRuleIds.includes(rowLevelPermissionRuleId);

  const removedPredicateGroupIds = new Set(
    (role.rowLevelPermissionPredicateGroups ?? [])
      .filter(isOfRemovedRule)
      .map(({ id }) => id),
  );

  const isNotOfRemovedRule = ({
    rowLevelPermissionPredicateGroupId,
  }: Pick<FieldPermission, 'rowLevelPermissionPredicateGroupId'>) =>
    !isDefined(rowLevelPermissionPredicateGroupId) ||
    !removedPredicateGroupIds.has(rowLevelPermissionPredicateGroupId);

  return {
    ...role,
    rowLevelPermissionRules: role.rowLevelPermissionRules?.filter(
      (rule) => !rowLevelPermissionRuleIds.includes(rule.id),
    ),
    rowLevelPermissionPredicates: role.rowLevelPermissionPredicates?.filter(
      (predicate) => !isOfRemovedRule(predicate),
    ),
    rowLevelPermissionPredicateGroups:
      role.rowLevelPermissionPredicateGroups?.filter(
        (predicateGroup) => !removedPredicateGroupIds.has(predicateGroup.id),
      ),
    fieldPermissions: role.fieldPermissions?.filter(isNotOfRemovedRule),
    rowLevelPermissionFieldPermissions:
      role.rowLevelPermissionFieldPermissions?.filter(isNotOfRemovedRule),
  };
};
