import { type ConditionalAvailabilityFilter } from '@/conditional-availability/types/ConditionalAvailabilityFilter';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/conditional-availability';

export type ConditionalAvailabilityFilterGroup = {
  type: 'filterGroup';
  id: string;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  children: (
    | ConditionalAvailabilityFilter
    | ConditionalAvailabilityFilterGroup
  )[];
};
