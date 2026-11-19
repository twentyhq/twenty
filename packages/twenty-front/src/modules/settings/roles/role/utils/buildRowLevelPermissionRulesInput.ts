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

  const ruleByKey = new Map<string, RowLevelPermissionRuleInput>();

  const getOrCreateRule = ({
    rowLevelPermissionRuleId,
    keyWithoutRule,
  }: {
    rowLevelPermissionRuleId: string | null | undefined;
    keyWithoutRule: string;
  }) => {
    const key = rowLevelPermissionRuleId ?? keyWithoutRule;
    const existingRule = ruleByKey.get(key);

    if (isDefined(existingRule)) {
      return existingRule;
    }

    const rule: RowLevelPermissionRuleInput = {
      id: rowLevelPermissionRuleId ?? undefined,
      ...ruleOperations,
      predicates: [],
      predicateGroups: [],
    };

    ruleByKey.set(key, rule);

    return rule;
  };

  for (const predicateGroup of predicateGroups) {
    if (isDefined(predicateGroup.parentRowLevelPermissionPredicateGroupId)) {
      continue;
    }

    getOrCreateRule({
      rowLevelPermissionRuleId: predicateGroup.rowLevelPermissionRuleId,
      keyWithoutRule: `predicate-group:${predicateGroup.id}`,
    }).predicateGroups?.push(toPredicateGroupInput(predicateGroup));
  }

  for (const predicate of predicates) {
    if (isDefined(predicate.rowLevelPermissionPredicateGroupId)) {
      continue;
    }

    getOrCreateRule({
      rowLevelPermissionRuleId: predicate.rowLevelPermissionRuleId,
      keyWithoutRule: 'ungrouped-predicates',
    }).predicates?.push(toPredicateInput(predicate));
  }

  return [...ruleByKey.values()];
};
