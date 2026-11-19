import { CONDITIONAL_AVAILABILITY_VALUE_COUNT_RANGE_BY_ARITY } from '@/conditional-availability/constants/ConditionalAvailabilityValueCountRangeByArity';
import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { getConditionalAvailabilityValueArity } from '@/conditional-availability/utils/getConditionalAvailabilityValueArity';

export const changeConditionalAvailabilityRowOperator = ({
  row,
  operator,
}: {
  row: ConditionalAvailabilityRow;
  operator: ConditionalAvailabilityOperator;
}): ConditionalAvailabilityRow => {
  const nextRow = { ...row, operator };
  const { max } =
    CONDITIONAL_AVAILABILITY_VALUE_COUNT_RANGE_BY_ARITY[
      getConditionalAvailabilityValueArity({ row: nextRow })
    ];

  return { ...nextRow, values: row.values.length <= max ? row.values : [] };
};
