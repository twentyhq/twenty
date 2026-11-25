import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { getConditionalAvailabilityFilterComparisonOperator } from '@/conditional-availability/utils/getConditionalAvailabilityFilterComparisonOperator';
import { getConditionalAvailabilityFilterOperatorValueShape } from '@/conditional-availability/utils/getConditionalAvailabilityFilterOperatorValueShape';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/utils/getConditionalAvailabilityFilterVariableOperators';
import { getConditionalAvailabilityValueListLogicalOperator } from '@/conditional-availability/utils/getConditionalAvailabilityValueListLogicalOperator';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/conditional-availability';
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
  logicalOperator: ConditionalAvailabilityLogicalOperator;
}): ConditionalAvailabilityFilter | null => {
  if (
    previousFilterOrGroup?.type !== 'filter' ||
    filterOrGroup.type !== 'filter' ||
    previousFilterOrGroup.variable !== filterOrGroup.variable
  ) {
    return null;
  }

  const comparisonOperator = getConditionalAvailabilityFilterComparisonOperator(
    {
      operator: filterOrGroup.operator,
    },
  );

  const valueListOperator = getConditionalAvailabilityFilterVariableOperators({
    variable: filterOrGroup.variable,
  }).find(
    (operator) =>
      getConditionalAvailabilityFilterComparisonOperator({ operator }) ===
        comparisonOperator &&
      getConditionalAvailabilityFilterOperatorValueShape({ operator }) ===
        'list',
  );

  if (
    !isDefined(valueListOperator) ||
    getConditionalAvailabilityFilterComparisonOperator({
      operator: previousFilterOrGroup.operator,
    }) !== comparisonOperator ||
    getConditionalAvailabilityValueListLogicalOperator({
      comparisonOperator,
    }) !== logicalOperator
  ) {
    return null;
  }

  return {
    ...previousFilterOrGroup,
    operator: valueListOperator,
    values: [...previousFilterOrGroup.values, ...filterOrGroup.values],
  };
};
