import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/types/ConditionalAvailabilityFilterOperator';
import { canConditionalAvailabilityFilterOperatorHoldSeveralValues } from '@/conditional-availability/utils/canConditionalAvailabilityFilterOperatorHoldSeveralValues';

export const updateConditionalAvailabilityFilterOperator = ({
  filter,
  operator,
}: {
  filter: ConditionalAvailabilityFilter;
  operator: ConditionalAvailabilityFilterOperator;
}): ConditionalAvailabilityFilter => {
  const canOperatorHoldFilterValues =
    filter.values.length <= 1 ||
    canConditionalAvailabilityFilterOperatorHoldSeveralValues({ operator });

  return {
    ...filter,
    operator,
    values: canOperatorHoldFilterValues ? filter.values : [],
  };
};
