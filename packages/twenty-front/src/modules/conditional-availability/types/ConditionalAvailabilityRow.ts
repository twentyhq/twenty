import { type ConditionalAvailabilityOperator } from '@/conditional-availability/types/ConditionalAvailabilityOperator';
import { type ConditionalAvailabilityRowSubject } from '@/conditional-availability/types/ConditionalAvailabilityRowSubject';

export type ConditionalAvailabilityRow = {
  id: string;
  operator: ConditionalAvailabilityOperator;
  values: string[];
} & ConditionalAvailabilityRowSubject;
