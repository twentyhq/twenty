import { CONDITIONAL_AVAILABILITY_VALUELESS_OPERATORS } from '@/conditional-availability/constants/ConditionalAvailabilityValuelessOperators';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityValueArity } from '@/conditional-availability/types/ConditionalAvailabilityValueArity';

export const getConditionalAvailabilityValueArity = ({
  row,
}: {
  row: ConditionalAvailabilityRow;
}): ConditionalAvailabilityValueArity => {
  if (CONDITIONAL_AVAILABILITY_VALUELESS_OPERATORS.includes(row.operator)) {
    return 'none';
  }

  const isList =
    row.operator === 'isAnyOf' ||
    row.operator === 'isNoneOf' ||
    (row.subject === 'recordField' && row.fieldKind === 'multiSelect');

  return isList ? 'list' : 'single';
};
