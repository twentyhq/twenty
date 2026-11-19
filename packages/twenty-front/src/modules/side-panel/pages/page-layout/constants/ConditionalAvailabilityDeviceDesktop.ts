import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

export const CONDITIONAL_AVAILABILITY_DEVICE_DESKTOP: ConditionalAvailabilityNode =
  {
    type: 'COMPARISON',
    operator: 'EQUAL',
    left: { type: 'PATH', path: 'device' },
    right: { type: 'LITERAL', value: 'DESKTOP' },
  };
