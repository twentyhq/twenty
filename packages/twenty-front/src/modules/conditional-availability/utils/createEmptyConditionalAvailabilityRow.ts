import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';
import { getConditionalAvailabilitySubjectRowOperators } from '@/conditional-availability/utils/getConditionalAvailabilitySubjectRowOperators';

export const createEmptyConditionalAvailabilityRow = ({
  id,
  subject,
}: {
  id: string;
  subject: ConditionalAvailabilitySubject;
}): ConditionalAvailabilityRow => {
  const [defaultOperator] = getConditionalAvailabilitySubjectRowOperators({
    subject,
  });

  return { type: 'row', id, subject, operator: defaultOperator, values: [] };
};
