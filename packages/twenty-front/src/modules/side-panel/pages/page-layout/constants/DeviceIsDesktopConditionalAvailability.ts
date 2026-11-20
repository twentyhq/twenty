import { type ConditionalAvailabilityNode } from 'twenty-shared/conditional-availability';

export const DEVICE_IS_DESKTOP_CONDITIONAL_AVAILABILITY: ConditionalAvailabilityNode =
  {
    type: 'COMPARISON',
    operator: 'EQUAL',
    left: { type: 'VARIABLE', path: 'device' },
    right: { type: 'LITERAL', value: 'DESKTOP' },
  };
