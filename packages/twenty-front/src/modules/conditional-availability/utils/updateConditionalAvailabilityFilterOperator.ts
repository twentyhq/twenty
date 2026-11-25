import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/types/ConditionalAvailabilityFilterOperator';
import { getConditionalAvailabilityFilterOperatorValueShape } from '@/conditional-availability/utils/getConditionalAvailabilityFilterOperatorValueShape';

export const updateConditionalAvailabilityFilterOperator = ({
  filter,
  operator,
}: {
  filter: ConditionalAvailabilityFilter;
  operator: ConditionalAvailabilityFilterOperator;
}): ConditionalAvailabilityFilter => {
  const canOperatorHoldFilterValues =
    getConditionalAvailabilityFilterOperatorValueShape({ operator }) ===
      'list' || filter.values.length <= 1;

  return {
    ...filter,
    operator,
    values: canOperatorHoldFilterValues ? filter.values : [],
  };
};
