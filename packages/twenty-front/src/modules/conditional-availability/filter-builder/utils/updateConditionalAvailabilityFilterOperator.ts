import { type ConditionalAvailabilityFilter } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { canConditionalAvailabilityFilterOperatorHoldSeveralValues } from '@/conditional-availability/filter-builder/utils/canConditionalAvailabilityFilterOperatorHoldSeveralValues';

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
