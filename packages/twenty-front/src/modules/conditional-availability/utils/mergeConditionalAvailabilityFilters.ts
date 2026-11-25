import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterGroup } from '@/conditional-availability/types/ConditionalAvailabilityFilterGroup';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/conditional-availability';

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
    previousFilterOrGroup.variable !== filterOrGroup.variable ||
    previousFilterOrGroup.operator !== filterOrGroup.operator
  ) {
    return null;
  }

  const filterValuesLogicalOperator =
    filterOrGroup.operator === 'EQUAL' ? 'OR' : 'AND';

  const hasValueInCommon = filterOrGroup.values.some((value) =>
    previousFilterOrGroup.values.includes(value),
  );

  if (filterValuesLogicalOperator !== logicalOperator || hasValueInCommon) {
    return null;
  }

  return {
    ...previousFilterOrGroup,
    values: [...previousFilterOrGroup.values, ...filterOrGroup.values],
  };
};
