import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { getConditionalAvailabilityFilterVariableOperators } from '@/conditional-availability/filter-builder/utils/getConditionalAvailabilityFilterVariableOperators';

export const getConditionalAvailabilityFilterOperators = ({
  filter,
}: {
  filter: ConditionalAvailabilityFilter;
}): [
  ConditionalAvailabilityFilterOperator,
  ...ConditionalAvailabilityFilterOperator[],
] => {
  if ('field' in filter) {
    return ['is', 'isNot', 'isAnyOf', 'isNoneOf'];
  }

  return getConditionalAvailabilityFilterVariableOperators({
    variable: filter.variable,
  });
};
