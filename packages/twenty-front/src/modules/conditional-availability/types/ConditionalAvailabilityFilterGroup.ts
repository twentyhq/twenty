import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalEvaluationLogicalOperator } from 'twenty-shared/conditional-evaluation';

export type ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup';
  id: string;
  logicalOperator: ConditionalEvaluationLogicalOperator;
  children: (
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup
  )[];
};
