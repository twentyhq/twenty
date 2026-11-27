import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterGroup';
import { canConditionalAvailabilityFilterOperatorHoldSeveralValues } from '@/conditional-availability/filter-builder/utils/canConditionalAvailabilityFilterOperatorHoldSeveralValues';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterOperators } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterOperators';
import { getConditionalAvailabilityFilterVariableOrFieldNode } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariableOrFieldNode';
import { type ExpressionLogicalOperator } from 'twenty-shared/expression';
import { doNotTranslate } from 'twenty-shared/i18n';
import { isDefined } from 'twenty-shared/utils';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

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
  logicalOperator: ExpressionLogicalOperator;
}): ConditionalAvailabilityFilter | null => {
  if (
    previousFilterOrGroup?.type !== 'filter' ||
    filterOrGroup.type !== 'filter' ||
    !isDeeplyEqual(
      getConditionalAvailabilityFilterVariableOrFieldNode({
        filter: previousFilterOrGroup,
      }),
      getConditionalAvailabilityFilterVariableOrFieldNode({
        filter: filterOrGroup,
      }),
    )
  ) {
    return null;
  }

  const comparisonOperator = getConditionalAvailabilityFilterComparisonOperator(
    { operator: filterOrGroup.operator },
  );

  const operatorHoldingSeveralValues =
    getConditionalAvailabilityFilterOperators({
      filter: filterOrGroup,
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
