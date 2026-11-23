import { CONDITIONAL_AVAILABILITY_DEVICES } from 'twenty-shared/conditional-availability';

export const WIDGET_VISIBILITY_DEVICES = [
  'ANY_DEVICE',
  ...CONDITIONAL_AVAILABILITY_DEVICES,
] as const;
