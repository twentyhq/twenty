import { type CONDITIONAL_AVAILABILITY_FILTER_VARIABLES } from '@/conditional-availability/filter-builder/constants/ConditionalAvailabilityFilterVariables';

export type ConditionalAvailabilityFilterVariable =
  (typeof CONDITIONAL_AVAILABILITY_FILTER_VARIABLES)[number];
