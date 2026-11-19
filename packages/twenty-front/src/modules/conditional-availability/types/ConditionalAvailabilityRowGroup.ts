import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityLogicalOperator } from 'twenty-shared/types';

export type ConditionalAvailabilityRowGroup = {
  id: string;
  logicalOperator: ConditionalAvailabilityLogicalOperator;
  rows: ConditionalAvailabilityRow[];
};
