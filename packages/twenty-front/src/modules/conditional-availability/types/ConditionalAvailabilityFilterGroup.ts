import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ExpressionLogicalOperator } from 'twenty-shared/expression';

export type ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup';
  id: string;
  logicalOperator: ExpressionLogicalOperator;
  children: (
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup
  )[];
};
