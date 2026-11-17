import { isDefined } from 'twenty-shared/utils';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  type RowLevelPermissionRuleInput,
  type RowLevelPermissionRulePredicateGroupInput,
  type RowLevelPermissionRulePredicateInput,
} from '~/generated-metadata/graphql';

type RowLevelPermissionRuleOperations = Pick<
  RowLevelPermissionRuleInput,
  | 'canReadRecords'
  | 'canCreateRecords'
  | 'canUpdateRecords'
  | 'canSoftDeleteRecords'
  | 'canDestroyRecords'
>;

export const buildRowLevelPermissionRulesInput = ({
  predicates,
  predicateGroups,
  ruleOperations,
}: {
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
  ruleOperations: RowLevelPermissionRuleOperations;
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

  const groupedRules = predicateGroups
    .filter(
      ({ parentRowLevelPermissionPredicateGroupId }) =>
        !isDefined(parentRowLevelPermissionPredicateGroupId),
    )
    .map((predicateGroup) => ({
      id: predicateGroup.rowLevelPermissionRuleId ?? undefined,
      ...ruleOperations,
      predicateGroups: [toPredicateGroupInput(predicateGroup)],
    }));

  const ungroupedPredicates = predicates.filter(
    ({ rowLevelPermissionPredicateGroupId }) =>
      !isDefined(rowLevelPermissionPredicateGroupId),
  );

  if (ungroupedPredicates.length === 0) {
    return groupedRules;
  }

  return [
    ...groupedRules,
    {
      id: ungroupedPredicates[0].rowLevelPermissionRuleId ?? undefined,
      ...ruleOperations,
      predicates: ungroupedPredicates.map(toPredicateInput),
    },
  ];
};
