import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/types/ConditionalAvailabilityFilterVariable';
import { type ConditionalAvailabilityComparisonOperator } from 'twenty-shared/conditional-availability';

export type ConditionalAvailabilityFilter = {
  type: 'filter';
  id: string;
  variable: ConditionalAvailabilityFilterVariable;
  operator: Extract<
    ConditionalAvailabilityComparisonOperator,
    'EQUAL' | 'NOT_EQUAL'
  >;
  values: string[];
};
