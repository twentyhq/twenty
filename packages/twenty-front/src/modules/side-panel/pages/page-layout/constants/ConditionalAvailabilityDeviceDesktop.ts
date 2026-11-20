import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';

export const CONDITIONAL_AVAILABILITY_DEVICE_DESKTOP: ConditionalAvailabilityNode =
  {
    type: 'COMPARISON',
    operator: 'EQUAL',
    left: { type: 'VARIABLE', path: 'device' },
    right: { type: 'LITERAL', value: 'DESKTOP' },
  };
