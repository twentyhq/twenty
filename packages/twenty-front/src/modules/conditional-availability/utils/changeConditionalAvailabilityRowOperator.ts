import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowOperator } from '@/conditional-availability/types/ConditionalAvailabilityRowOperator';
import { getConditionalAvailabilityRowOperatorValueShape } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperatorValueShape';

export const changeConditionalAvailabilityRowOperator = ({
  row,
  operator,
}: {
  row: ConditionalAvailabilityRow;
  operator: ConditionalAvailabilityRowOperator;
}): ConditionalAvailabilityRow => {
  const canOperatorHoldRowValues =
    getConditionalAvailabilityRowOperatorValueShape({ operator }) === 'list' ||
    row.values.length <= 1;

  return {
    ...row,
    operator,
    values: canOperatorHoldRowValues ? row.values : [],
  };
};
