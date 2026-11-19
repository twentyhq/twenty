import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';

export const CONDITIONAL_AVAILABILITY_SUBJECT_OPERATORS: Record<
  ConditionalAvailabilitySubject,
  ConditionalAvailabilityOperator[]
> = {
  role: ['isAnyOf', 'isNoneOf'],
  workspaceMember: ['is', 'isNot', 'isAnyOf', 'isNoneOf'],
  device: ['is'],
};
