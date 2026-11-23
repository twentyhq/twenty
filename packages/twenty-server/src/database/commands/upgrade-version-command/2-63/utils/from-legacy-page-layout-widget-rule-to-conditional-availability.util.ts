import { isNonEmptyString } from '@sniptt/guards';
import {
  buildDeviceConditionalAvailability,
  CONDITIONAL_AVAILABILITY_DEVICES,
  type ConditionalAvailabilityDevice,
  type ConditionalAvailabilityNode,
  parseConditionalAvailabilityExpression,
} from 'twenty-shared/conditional-availability';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

type LegacyPageLayoutWidgetRuleConversion =
  | { isValid: true; node: ConditionalAvailabilityNode | null }
  | { isValid: false; errorMessage: string };

// The json-logic shape of built-in widgets, kept here so the command still reads it once the built-in constants are gone; any other shape is reported and left alone
const buildLegacyDeviceJsonLogic = (device: ConditionalAvailabilityDevice) => ({
  and: [{ '===': [{ var: 'device' }, device] }],
});

export const fromLegacyPageLayoutWidgetRuleToConditionalAvailability = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
}: {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: unknown;
}): LegacyPageLayoutWidgetRuleConversion => {
  if (isNonEmptyString(conditionalAvailabilityExpression)) {
    return parseConditionalAvailabilityExpression({
      expression: conditionalAvailabilityExpression,
      metadataName: 'pageLayoutWidget',
    });
  }

  if (!isDefined(conditionalDisplay)) {
    return { isValid: true, node: null };
  }

  const device = CONDITIONAL_AVAILABILITY_DEVICES.find((legacyDevice) =>
    fastDeepEqual(conditionalDisplay, buildLegacyDeviceJsonLogic(legacyDevice)),
  );

  if (!isDefined(device)) {
    return {
      isValid: false,
      errorMessage: 'The json-logic rule is not one of the two device rules',
    };
  }

  return { isValid: true, node: buildDeviceConditionalAvailability(device) };
};
