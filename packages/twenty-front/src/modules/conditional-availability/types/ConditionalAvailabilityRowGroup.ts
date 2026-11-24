import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/conditional-availability';

export type ConditionalAvailabilityRowGroup = {
  type: 'group';
  id: string;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  children: ConditionalAvailabilityRowTreeChild[];
};
