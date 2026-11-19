import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityPathSubject } from '@/conditional-availability/types/ConditionalAvailabilityPathSubject';

export const CONDITIONAL_AVAILABILITY_SUBJECT_OPERATORS: Record<
  ConditionalAvailabilityPathSubject,
  ConditionalAvailabilityOperator[]
> = {
  role: ['isAnyOf', 'isNoneOf'],
  workspaceMember: ['is', 'isNot', 'isAnyOf', 'isNoneOf'],
  device: ['is'],
};
