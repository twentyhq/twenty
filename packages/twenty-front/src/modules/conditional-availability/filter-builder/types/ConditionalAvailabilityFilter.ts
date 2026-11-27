import { type ConditionalAvailabilityFilterOperator } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterOperator';
import { type ConditionalAvailabilityFilterVariable } from '@/conditional-availability/filter-builder/types/ConditionalAvailabilityFilterVariable';
import { type ExpressionFieldNode } from 'twenty-shared/expression';

export type ConditionalAvailabilityFilter = {
  type: 'filter';
  id: string;
  operator: ConditionalAvailabilityFilterOperator;
  values: string[];
} & (
  | { variable: ConditionalAvailabilityFilterVariable }
  | { field: ExpressionFieldNode }
);
