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
  const arity = getConditionalAvailabilityValueArity({ row: nextRow });
  const keepsValues =
    arity === 'list' ||
    row.values.length === 0 ||
    (arity === 'single' && row.values.length === 1);

  return { ...nextRow, values: keepsValues ? row.values : [] };
};
