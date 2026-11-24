import { type CONDITIONAL_AVAILABILITY_SUBJECTS } from '@/conditional-availability/constants/ConditionalAvailabilitySubjects';

export type ConditionalAvailabilitySubject =
  (typeof CONDITIONAL_AVAILABILITY_SUBJECTS)[number];
