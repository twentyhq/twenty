import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityValueArity } from '@/conditional-availability/types/ConditionalAvailabilityValueArity';

export const getConditionalAvailabilityValueArity = ({
  row,
}: {
  row: ConditionalAvailabilityRow;
}): ConditionalAvailabilityValueArity =>
  row.operator === 'isAnyOf' || row.operator === 'isNoneOf' ? 'list' : 'single';
