import { type ConditionalAvailabilityDevice } from 'twenty-shared/types';

export const CONDITIONAL_AVAILABILITY_DEVICES = [
  'DESKTOP',
  'MOBILE',
] as const satisfies readonly ConditionalAvailabilityDevice[];
