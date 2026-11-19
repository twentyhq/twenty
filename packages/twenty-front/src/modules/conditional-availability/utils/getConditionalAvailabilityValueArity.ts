import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityValueArity } from '@/conditional-availability/types/ConditionalAvailabilityValueArity';

export const getConditionalAvailabilityValueArity = ({
  row,
}: {
  row: ConditionalAvailabilityRow;
}): ConditionalAvailabilityValueArity => {
  switch (row.operator) {
    case 'isEmpty':
    case 'isNotEmpty':
    case 'isInPast':
    case 'isInFuture':
      return 'none';
    case 'isAnyOf':
    case 'isNoneOf':
      return 'list';
    default:
      return row.subject === 'recordField' && row.fieldKind === 'multiSelect'
        ? 'list'
        : 'single';
  }
};
