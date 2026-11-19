import { type ConditionalAvailabilityRowTree } from '@/conditional-availability/types/ConditionalAvailabilityRowTree';

export type ConditionalAvailabilityReadResult =
  | { status: 'empty' }
  | { status: 'rows'; tree: ConditionalAvailabilityRowTree }
  | { status: 'unsupported' };
