import { fastDeepEqual } from 'twenty-shared/utils';

import { LEGACY_DEVICE_CONDITIONAL_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/2-56/constants/legacy-device-conditional-expressions.constant';

export const findLegacyDeviceConditionalExpressionByConditionalDisplay = (
  conditionalDisplay: unknown,
) =>
  LEGACY_DEVICE_CONDITIONAL_EXPRESSIONS.find(
    (legacyDeviceConditionalExpression) =>
      fastDeepEqual(
        legacyDeviceConditionalExpression.conditionalDisplay,
        conditionalDisplay,
      ),
  );
