import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';

export type ConditionalAvailabilityFilterGroupValidation =
  | { isValid: true; node: ConditionalAvailabilityNode | null }
  | { isValid: false; reason: 'invalidFilters' | 'invalidNode' };
