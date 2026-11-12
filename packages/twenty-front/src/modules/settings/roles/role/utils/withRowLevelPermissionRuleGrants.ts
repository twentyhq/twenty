import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { isDefined } from 'twenty-shared/utils';
import { RowLevelPermissionPredicateGroupLogicalOperator } from '~/generated-metadata/graphql';

export const withRowLevelPermissionRuleGrants = (
  role: RoleWithPartialMembers,
): RoleWithPartialMembers => {
  const rules = role.rowLevelPermissionRules ?? [];

  if (rules.length === 0) {
    return role;
  }

  const fieldPermissions = [
    ...(role.fieldPermissions ?? []),
    ...(role.rowLevelPermissionFieldPermissions ?? []),
  ];

  const ruleById = new Map(rules.map((rule) => [rule.id, rule]));
  const predicateGroups = [...(role.rowLevelPermissionPredicateGroups ?? [])];
  const groupIds = new Set(predicateGroups.map(({ id }) => id));

  const predicates = (role.rowLevelPermissionPredicates ?? []).map(
    (predicate) => {
      const rule = isDefined(predicate.rowLevelPermissionRuleId)
        ? ruleById.get(predicate.rowLevelPermissionRuleId)
        : undefined;

      if (
        isDefined(predicate.rowLevelPermissionPredicateGroupId) ||
        isDefined(predicate.relationFieldMetadataId) ||
        !isDefined(rule)
      ) {
        return predicate;
      }

      if (!groupIds.has(rule.id)) {
        groupIds.add(rule.id);
        predicateGroups.push({
          __typename: 'RowLevelPermissionPredicateGroup',
          id: rule.id,
          parentRowLevelPermissionPredicateGroupId: null,
          logicalOperator: RowLevelPermissionPredicateGroupLogicalOperator.AND,
          positionInRowLevelPermissionPredicateGroup: null,
          canReadRecords: false,
          canUpdateRecords: false,
          canSoftDeleteRecords: false,
          canDestroyRecords: false,
          roleId: role.id,
          objectMetadataId: rule.objectMetadataId,
          rowLevelPermissionRuleId: rule.id,
        });
      }

      return { ...predicate, rowLevelPermissionPredicateGroupId: rule.id };
    },
  );

  return {
    ...role,
    fieldPermissions,
    rowLevelPermissionPredicates: predicates,
    rowLevelPermissionPredicateGroups: predicateGroups.map((predicateGroup) => {
      if (
        isDefined(predicateGroup.parentRowLevelPermissionPredicateGroupId) ||
        !isDefined(predicateGroup.rowLevelPermissionRuleId)
      ) {
        return predicateGroup;
      }

      const rule = ruleById.get(predicateGroup.rowLevelPermissionRuleId);

      if (!isDefined(rule)) {
        return predicateGroup;
      }

      return {
        ...predicateGroup,
        canReadRecords: rule.canReadRecords,
        canUpdateRecords: rule.canUpdateRecords,
        canSoftDeleteRecords: rule.canSoftDeleteRecords,
        canDestroyRecords: rule.canDestroyRecords,
      };
    }),
  };
};
