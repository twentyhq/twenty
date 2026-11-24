import { type ConditionalAvailabilityRowOperator } from '@/conditional-availability/types/ConditionalAvailabilityRowOperator';
import { type ConditionalAvailabilitySubject } from '@/conditional-availability/types/ConditionalAvailabilitySubject';

export type ConditionalAvailabilityRow = {
  type: 'row';
  id: string;
  subject: ConditionalAvailabilitySubject;
  operator: ConditionalAvailabilityRowOperator;
  values: string[];
};
