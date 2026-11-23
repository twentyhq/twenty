import { isNonEmptyString } from '@sniptt/guards';
import {
  buildDeviceConditionalAvailability,
  type ConditionalAvailabilityDevice,
  type ConditionalAvailabilityNode,
  parseConditionalAvailabilityExpression,
} from 'twenty-shared/conditional-availability';
import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

type LegacyPageLayoutWidgetRuleConversion =
  | { isValid: true; node: ConditionalAvailabilityNode | null }
  | { isValid: false; errorMessage: string };

// The only json-logic shape Twenty ever wrote on a widget, one per device.
// Written out here so the command keeps reading it after the built-in constants are gone.
const buildLegacyDeviceJsonLogic = (device: ConditionalAvailabilityDevice) => ({
  and: [{ '===': [{ var: 'device' }, device] }],
});

const LEGACY_JSON_LOGIC_DEVICES: ConditionalAvailabilityDevice[] = [
  'MOBILE',
  'DESKTOP',
];

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

  const device = LEGACY_JSON_LOGIC_DEVICES.find((legacyJsonLogicDevice) =>
    fastDeepEqual(
      conditionalDisplay,
      buildLegacyDeviceJsonLogic(legacyJsonLogicDevice),
    ),
  );

  if (!isDefined(device)) {
    return {
      isValid: false,
      errorMessage: 'The json-logic rule is not one of the two device rules',
    };
  }

  return { isValid: true, node: buildDeviceConditionalAvailability(device) };
};
