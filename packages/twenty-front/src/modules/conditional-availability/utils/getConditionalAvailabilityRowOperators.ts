import { CONDITIONAL_AVAILABILITY_SUBJECT_OPERATORS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjectOperators';
import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';

export const getConditionalAvailabilityRowOperators = ({
  rowSubject,
}: {
  rowSubject: ConditionalAvailabilityRowSubject;
}): ConditionalAvailabilityOperator[] =>
  CONDITIONAL_AVAILABILITY_SUBJECT_OPERATORS[rowSubject.subject];
