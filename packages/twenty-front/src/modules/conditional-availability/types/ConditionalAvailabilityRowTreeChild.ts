import { type ConditionalAvailabilityRow } from '@/conditional-availability/types/ConditionalAvailabilityRow';
import { type ConditionalAvailabilityRowGroup } from '@/conditional-availability/types/ConditionalAvailabilityRowGroup';

export type ConditionalAvailabilityRowTreeChild =
  | ConditionalAvailabilityRow
  | ConditionalAvailabilityRowGroup;
