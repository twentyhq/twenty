import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/types/ConditionalAvailabilityFilterOperator';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/types/ConditionalAvailabilityFilterVariable';

export type ConditionalAvailabilityFilter = {
  type: 'filter';
  id: string;
  variable: ConditionalAvailabilityFilterVariable;
  operator: ConditionalAvailabilityFilterOperator;
  values: string[];
};
