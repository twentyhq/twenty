import { type CONDITIONAL_AVAILABILITY_FILTER_VARIABLES } from '@/conditional-availability/constants/ConditionalAvailabilityFilterVariables';

export type ConditionalAvailabilityFilterVariable =
  (typeof CONDITIONAL_AVAILABILITY_FILTER_VARIABLES)[number];
