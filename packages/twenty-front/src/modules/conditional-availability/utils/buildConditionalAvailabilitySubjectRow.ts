import { CONDITIONAL_AVAILABILITY_NEGATED_OPERATORS } from '@/conditional-availability/constants/ConditionalAvailabilityNegatedOperators';
import { CONDITIONAL_AVAILABILITY_SUBJECT_OPERATORS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectOperators';
import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';
import { pickConditionalAvailabilityRow } from '@/conditional-availability/utils/pickConditionalAvailabilityRow';

export const buildConditionalAvailabilitySubjectRow = ({
  subject,
  isNegated,
  values,
}: {
  subject: ConditionalAvailabilityPathSubject;
  isNegated: boolean;
  values: string[];
}): ConditionalAvailabilityRow | null =>
  pickConditionalAvailabilityRow({
    rowSubject: { subject },
    operators: CONDITIONAL_AVAILABILITY_SUBJECT_OPERATORS[subject].filter(
      (operator) =>
        CONDITIONAL_AVAILABILITY_NEGATED_OPERATORS.includes(operator) ===
        isNegated,
    ),
    values,
  });
