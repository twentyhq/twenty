import { type ConditionalAvailabilityRowOrGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowOrGroup';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/conditional-availability';

export type ConditionalAvailabilityRowGroup = {
  type: 'group';
  id: string;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  children: ConditionalAvailabilityRowOrGroup[];
};
