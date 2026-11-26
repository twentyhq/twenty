import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { canConditionalAvailabilityFilterOperatorHoldSeveralValues } from '@/conditional-availability/utils/canConditionalAvailabilityFilterOperatorHoldSeveralValues';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariableOperators';
import { type ConditionalEvaluationLogicalOperator } from 'twenty-shared/conditional-evaluation';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';

export const mergeConditionalAvailabilityFilters = ({
  previousFilterOrGroup,
  filterOrGroup,
  logicalOperator,
}: {
  previousFilterOrGroup:
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup
    | undefined;
  filterOrGroup:
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup;
  logicalOperator: ConditionalEvaluationLogicalOperator;
}): ConditionalAvailabilityFilter | null => {
  if (
    previousFilterOrGroup?.type !== 'filter' ||
    filterOrGroup.type !== 'filter' ||
    previousFilterOrGroup.variable !== filterOrGroup.variable
  ) {
    return null;
  }

  const comparisonOperator = getConditionalAvailabilityFilterComparisonOperator(
    { operator: filterOrGroup.operator },
  );

  const operatorHoldingSeveralValues =
    getConditionalAvailabilityFilterVariableOperators({
      variable: filterOrGroup.variable,
    }).find(
      (operator) =>
        getConditionalAvailabilityFilterComparisonOperator({ operator }) ===
          comparisonOperator &&
        canConditionalAvailabilityFilterOperatorHoldSeveralValues({ operator }),
    );

  const filterValuesLogicalOperator =
    comparisonOperator === 'EQUAL'
      ? doNotTranslate('OR')
      : doNotTranslate('AND');

  const hasValueInCommon = filterOrGroup.values.some((value) =>
    previousFilterOrGroup.values.includes(value),
  );

  if (
    !isDefined(operatorHoldingSeveralValues) ||
    getConditionalAvailabilityFilterComparisonOperator({
      operator: previousFilterOrGroup.operator,
    }) !== comparisonOperator ||
    filterValuesLogicalOperator !== logicalOperator ||
    hasValueInCommon
  ) {
    return null;
  }

  return {
    ...previousFilterOrGroup,
    operator: operatorHoldingSeveralValues,
    values: [...previousFilterOrGroup.values, ...filterOrGroup.values],
  };
};
