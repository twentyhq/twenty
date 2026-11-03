import { CONDITIONAL_DISPLAY_DEVICES } from 'twenty-shared/constants';
import { type ConditionalDisplay } from 'twenty-shared/types';
import { buildDeviceConditionalDisplay } from 'twenty-shared/utils';

export const LEGACY_DEVICE_CONDITIONAL_EXPRESSIONS: {
  conditionalAvailabilityExpression: string;
  legacyConditionalDisplay: Record<string, unknown>;
  conditionalDisplay: ConditionalDisplay;
}[] = CONDITIONAL_DISPLAY_DEVICES.map((device) => ({
  conditionalAvailabilityExpression: `device == "${device}"`,
  legacyConditionalDisplay: {
    and: [{ '===': [{ var: 'device' }, device] }],
  },
  conditionalDisplay: buildDeviceConditionalDisplay(device),
}));
