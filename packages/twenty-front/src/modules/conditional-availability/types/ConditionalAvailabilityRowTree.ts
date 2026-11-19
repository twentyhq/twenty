import { type ConditionalAvailabilityRowTreeChild } from '@/conditional-availability/types/ConditionalAvailabilityRowTreeChild';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';

export type ConditionalAvailabilityRowTree = {
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  children: ConditionalAvailabilityRowTreeChild[];
};
