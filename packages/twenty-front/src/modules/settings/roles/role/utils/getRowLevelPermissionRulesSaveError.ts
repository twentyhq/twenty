import { getRulePredicateGroupIds } from '@/settings/roles/role-permissions/object-level-permissions/record-level-permissions/utils/getRulePredicateGroupIds';
import { type RoleWithPartialMembers } from '@/settings/roles/types/RoleWithPartialMembers';
import { t } from '@lingui/core/macro';
import {
  isDefined,
  isRecordFilterValueValid,
  mapRLSOperandToRecordFilterOperand,
} from 'twenty-shared/utils';

export const getRowLevelPermissionRulesSaveError = (
  role: Pick<
    RoleWithPartialMembers,
    'rowLevelPermissionPredicates' | 'rowLevelPermissionPredicateGroups'
  >,
): string | undefined => {
  const predicateGroups = role.rowLevelPermissionPredicateGroups ?? [];
  const predicates = role.rowLevelPermissionPredicates ?? [];

  const hasRuleWithoutFilter = predicateGroups
    .filter(
      (predicateGroup) =>
        !isDefined(predicateGroup.parentRowLevelPermissionPredicateGroupId),
    )
    .some((rootPredicateGroup) => {
      const rulePredicateGroupIds = getRulePredicateGroupIds({
        predicateGroups,
        ruleRootGroupId: rootPredicateGroup.id,
      });

      return !predicates.some(
        (predicate) =>
          isDefined(predicate.rowLevelPermissionPredicateGroupId) &&
          rulePredicateGroupIds.has(
            predicate.rowLevelPermissionPredicateGroupId,
          ),
      );
    });

  if (hasRuleWithoutFilter) {
    return t`Each rule needs at least one condition`;
  }

  const hasFilterWithoutValue = predicates.some(
    (predicate) =>
      !isDefined(predicate.workspaceMemberFieldMetadataId) &&
      !isDefined(predicate.relationFieldMetadataId) &&
      !isRecordFilterValueValid({
        operand: mapRLSOperandToRecordFilterOperand(predicate.operand),
        value: predicate.value ?? '',
      }),
  );

  if (hasFilterWithoutValue) {
    return t`A rule condition is missing its value`;
  }

  return undefined;
};
