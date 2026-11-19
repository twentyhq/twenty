import { type ConditionalAvailabilityNode } from 'twenty-shared/types';

export const CONDITIONAL_AVAILABILITY_DEVICE_MOBILE: ConditionalAvailabilityNode =
  {
    type: 'COMPARISON',
    operator: 'EQUAL',
    left: { type: 'PATH', path: 'device' },
    right: { type: 'LITERAL', value: 'MOBILE' },
  };
