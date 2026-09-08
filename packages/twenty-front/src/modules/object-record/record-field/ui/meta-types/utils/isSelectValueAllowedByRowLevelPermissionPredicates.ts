/* @license Enterprise */

import groupBy from 'lodash.groupby';
import {
  type RowLevelPermissionPredicate,
  type RowLevelPermissionPredicateGroup,
  RowLevelPermissionPredicateGroupLogicalOperator,
  RowLevelPermissionPredicateOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Predicate values for select fields can be:
// - an actual array: ["BIRD", "DOG"]
// - a JSON-stringified array: "[\"BIRD\",\"DOG\"]"
// - a plain string: "BIRD"
const parsePredicateValueAsStringArray = (
  value: RowLevelPermissionPredicate['value'],
): string[] | null => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string');
  }

  if (typeof value === 'string') {
    if (value.startsWith('[')) {
      try {
        const parsed: unknown = JSON.parse(value);

        if (
          Array.isArray(parsed) &&
          parsed.every((item) => typeof item === 'string')
        ) {
          return parsed;
        }
      } catch {
        // not valid JSON, treat as single value
      }
    }

    return [value];
  }

  return null;
};

type SelectValueToEvaluate = {
  fieldMetadataId: string;
  selectValue: string | null;
};

// Only predicates on the edited field can be decided from the picker. Every
// other predicate counts as satisfiable, the server re-validates on write.
const isPredicateSatisfiable = (
  predicate: RowLevelPermissionPredicate,
  { fieldMetadataId, selectValue }: SelectValueToEvaluate,
): boolean => {
  if (predicate.fieldMetadataId !== fieldMetadataId) {
    return true;
  }

  switch (predicate.operand) {
    case RowLevelPermissionPredicateOperand.IS_EMPTY:
      return !isDefined(selectValue);
    case RowLevelPermissionPredicateOperand.IS_NOT_EMPTY:
      return isDefined(selectValue);
    case RowLevelPermissionPredicateOperand.IS:
    case RowLevelPermissionPredicateOperand.CONTAINS:
    case RowLevelPermissionPredicateOperand.IS_NOT:
    case RowLevelPermissionPredicateOperand.DOES_NOT_CONTAIN: {
      if (!isDefined(selectValue)) {
        return false;
      }

      const values = parsePredicateValueAsStringArray(predicate.value);

      if (!isDefined(values)) {
        return true;
      }

      const isSelectValueInPredicateValues = values.includes(selectValue);

      return predicate.operand === RowLevelPermissionPredicateOperand.IS ||
        predicate.operand === RowLevelPermissionPredicateOperand.CONTAINS
        ? isSelectValueInPredicateValues
        : !isSelectValueInPredicateValues;
    }
    default:
      return true;
  }
};

const isGroupSatisfiable = ({
  group,
  predicatesByGroupId,
  groupsByParentGroupId,
  selectValueToEvaluate,
}: {
  group: RowLevelPermissionPredicateGroup;
  predicatesByGroupId: Record<string, RowLevelPermissionPredicate[]>;
  groupsByParentGroupId: Record<string, RowLevelPermissionPredicateGroup[]>;
  selectValueToEvaluate: SelectValueToEvaluate;
}): boolean => {
  const childPredicates = predicatesByGroupId[group.id] ?? [];
  const childGroups = groupsByParentGroupId[group.id] ?? [];

  if (childPredicates.length === 0 && childGroups.length === 0) {
    return true;
  }

  const isChildPredicateSatisfiable = (
    predicate: RowLevelPermissionPredicate,
  ) => isPredicateSatisfiable(predicate, selectValueToEvaluate);

  const isChildGroupSatisfiable = (
    childGroup: RowLevelPermissionPredicateGroup,
  ) =>
    isGroupSatisfiable({
      group: childGroup,
      predicatesByGroupId,
      groupsByParentGroupId,
      selectValueToEvaluate,
    });

  if (
    group.logicalOperator === RowLevelPermissionPredicateGroupLogicalOperator.OR
  ) {
    return (
      childPredicates.some(isChildPredicateSatisfiable) ||
      childGroups.some(isChildGroupSatisfiable)
    );
  }

  return (
    childPredicates.every(isChildPredicateSatisfiable) &&
    childGroups.every(isChildGroupSatisfiable)
  );
};

// Mirrors computeRecordGqlOperationFilter: ungrouped predicates are ANDed with
// the root groups, and every role's root group is ANDed with the others.
export const isSelectValueAllowedByRowLevelPermissionPredicates = ({
  fieldMetadataId,
  selectValue,
  predicates,
  predicateGroups,
}: SelectValueToEvaluate & {
  predicates: RowLevelPermissionPredicate[];
  predicateGroups: RowLevelPermissionPredicateGroup[];
}): boolean => {
  const selectValueToEvaluate = { fieldMetadataId, selectValue };

  const ungroupedPredicates = predicates.filter(
    (predicate) => !isDefined(predicate.rowLevelPermissionPredicateGroupId),
  );

  const rootGroups = predicateGroups.filter(
    (group) => !isDefined(group.parentRowLevelPermissionPredicateGroupId),
  );

  const predicatesByGroupId = groupBy(
    predicates.filter((predicate) =>
      isDefined(predicate.rowLevelPermissionPredicateGroupId),
    ),
    (predicate) => predicate.rowLevelPermissionPredicateGroupId,
  );

  const groupsByParentGroupId = groupBy(
    predicateGroups.filter((group) =>
      isDefined(group.parentRowLevelPermissionPredicateGroupId),
    ),
    (group) => group.parentRowLevelPermissionPredicateGroupId,
  );

  return (
    ungroupedPredicates.every((predicate) =>
      isPredicateSatisfiable(predicate, selectValueToEvaluate),
    ) &&
    rootGroups.every((group) =>
      isGroupSatisfiable({
        group,
        predicatesByGroupId,
        groupsByParentGroupId,
        selectValueToEvaluate,
      }),
    )
  );
};
