import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';
import { isConditionalAvailabilityRowComplete } from '@/conditional-availability/utils/isConditionalAvailabilityRowComplete';
import { v4 } from 'uuid';

export const pickConditionalAvailabilityRow = ({
  rowSubject,
  operators,
  values,
}: {
  rowSubject: ConditionalAvailabilityRowSubject;
  operators: ConditionalAvailabilityOperator[];
  values: string[];
}): ConditionalAvailabilityRow | null => {
  const id = v4();
  const rows = operators.map((operator): ConditionalAvailabilityRow => ({
    id,
    ...rowSubject,
    operator,
    values,
  }));

  return (
    rows.find((row) => isConditionalAvailabilityRowComplete({ row })) ??
    rows[0] ??
    null
  );
};
