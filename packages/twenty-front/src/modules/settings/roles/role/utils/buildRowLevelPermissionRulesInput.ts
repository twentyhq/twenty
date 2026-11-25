import { isDefined } from 'twenty-shared/utils';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  type RowLevelPermissionRule,
  type RowLevelPermissionRuleInput,
  type RowLevelPermissionRulePredicateGroupInput,
  type RowLevelPermissionRulePredicateInput,
} from '~/generated-metadata/graphql';

export const buildRowLevelPermissionRulesInput = ({
  rules,
  predicates,
  predicateGroups,
}: {
  rules: RowLevelPermissionRule[];
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
}): RowLevelPermissionRuleInput[] => {
  const toPredicateInput = (
    predicate: RowLevelPermissionPredicate,
  ): RowLevelPermissionRulePredicateInput => ({
    id: predicate.id,
    fieldMetadataId: predicate.fieldMetadataId,
    relationFieldMetadataId: predicate.relationFieldMetadataId,
    operand: predicate.operand,
    value: predicate.value,
    subFieldName: predicate.subFieldName,
    workspaceMemberFieldMetadataId: predicate.workspaceMemberFieldMetadataId,
    workspaceMemberSubFieldName: predicate.workspaceMemberSubFieldName,
    position: predicate.positionInRowLevelPermissionPredicateGroup,
  });

  const toPredicateGroupInput = (
    predicateGroup: RowLevelPermissionPredicateGroup,
  ): RowLevelPermissionRulePredicateGroupInput => ({
    id: predicateGroup.id,
    logicalOperator: predicateGroup.logicalOperator,
    position: predicateGroup.positionInRowLevelPermissionPredicateGroup,
    predicates: predicates
      .filter(
        ({ rowLevelPermissionPredicateGroupId }) =>
          rowLevelPermissionPredicateGroupId === predicateGroup.id,
      )
      .map(toPredicateInput),
    predicateGroups: predicateGroups
      .filter(
        ({ parentRowLevelPermissionPredicateGroupId }) =>
          parentRowLevelPermissionPredicateGroupId === predicateGroup.id,
      )
      .map(toPredicateGroupInput),
  });

  return rules
    .filter((rule) =>
      predicates.some(
        ({ rowLevelPermissionRuleId }) => rowLevelPermissionRuleId === rule.id,
      ),
    )
    .map((rule) => ({
      id: rule.id,
      canReadRecords: rule.canReadRecords,
      canCreateRecords: rule.canCreateRecords,
      canUpdateRecords: rule.canUpdateRecords,
      canSoftDeleteRecords: rule.canSoftDeleteRecords,
      canDestroyRecords: rule.canDestroyRecords,
      predicates: predicates
        .filter(
          (predicate) =>
            predicate.rowLevelPermissionRuleId === rule.id &&
            !isDefined(predicate.rowLevelPermissionPredicateGroupId),
        )
        .map(toPredicateInput),
      predicateGroups: predicateGroups
        .filter(
          (predicateGroup) =>
            predicateGroup.rowLevelPermissionRuleId === rule.id &&
            !isDefined(predicateGroup.parentRowLevelPermissionPredicateGroupId),
        )
        .map(toPredicateGroupInput),
    }));
};
