import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';
import { getConditionalAvailabilityRowOperators } from '@/conditional-availability/utils/getConditionalAvailabilityRowOperators';
import { isDefined } from 'twenty-shared/utils';

export const createConditionalAvailabilityRow = ({
  id,
  rowSubject,
}: {
  id: string;
  rowSubject: ConditionalAvailabilityRowSubject;
}): ConditionalAvailabilityRow | null => {
  const [operator] = getConditionalAvailabilityRowOperators({ rowSubject });

  return isDefined(operator)
    ? { id, ...rowSubject, operator, values: [] }
    : null;
};
