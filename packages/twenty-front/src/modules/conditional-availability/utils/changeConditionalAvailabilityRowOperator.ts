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
  const shouldKeepValues =
    getConditionalAvailabilityValueArity({ row: nextRow }) === 'list' ||
    row.values.length <= 1;

  return { ...nextRow, values: shouldKeepValues ? row.values : [] };
};
