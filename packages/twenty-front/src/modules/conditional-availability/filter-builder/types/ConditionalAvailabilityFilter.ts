import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';

export type ConditionalAvailabilityFilter = {
  type: 'filter';
  id: string;
  variable: ConditionalAvailabilityFilterVariable;
  operator: ConditionalAvailabilityFilterOperator;
  values: string[];
};
