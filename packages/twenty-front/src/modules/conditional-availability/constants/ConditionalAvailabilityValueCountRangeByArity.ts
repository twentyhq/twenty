import { type ConditionalAvailabilityValueArity } from '@/conditional-availability/types/ConditionalAvailabilityValueArity';

export const CONDITIONAL_AVAILABILITY_VALUE_COUNT_RANGE_BY_ARITY: Record<
  ConditionalAvailabilityValueArity,
  { min: number; max: number }
> = {
  none: { min: 0, max: 0 },
  single: { min: 1, max: 1 },
  list: { min: 1, max: Number.POSITIVE_INFINITY },
};
