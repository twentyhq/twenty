import {
  type ConditionalDisplay,
  ViewFilterOperand,
} from 'twenty-shared/types';

export const LEGACY_WIDGET_DEVICE_VISIBILITIES: {
  conditionalAvailabilityExpression: string;
  conditionalDisplay: ConditionalDisplay;
}[] = [
  {
    conditionalAvailabilityExpression: 'device == "MOBILE"',
    conditionalDisplay: {
      recordFilters: [
        {
          id: '0',
          contextKey: 'device',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify(['MOBILE']),
        },
      ],
    },
  },
  {
    conditionalAvailabilityExpression: 'device == "DESKTOP"',
    conditionalDisplay: {
      recordFilters: [
        {
          id: '0',
          contextKey: 'device',
          operand: ViewFilterOperand.IS,
          value: JSON.stringify(['DESKTOP']),
        },
      ],
    },
  },
];
