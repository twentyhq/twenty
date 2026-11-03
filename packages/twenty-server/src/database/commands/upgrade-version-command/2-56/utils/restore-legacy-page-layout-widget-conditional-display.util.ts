import { isDefined } from 'twenty-shared/utils';

import { findLegacyDeviceConditionalExpressionByConditionalDisplay } from 'src/database/commands/upgrade-version-command/2-56/utils/find-legacy-device-conditional-expression-by-conditional-display.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export const restoreLegacyPageLayoutWidgetConditionalDisplay = ({
  conditionalAvailabilityExpression,
  conditionalDisplay,
}: {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalDisplay: FlatPageLayoutWidget['conditionalDisplay'];
}): FlatPageLayoutWidget['conditionalDisplay'] | Record<string, unknown> => {
  const legacyDeviceConditionalExpression =
    findLegacyDeviceConditionalExpressionByConditionalDisplay(
      conditionalDisplay,
    );

  if (!isDefined(legacyDeviceConditionalExpression)) {
    return conditionalDisplay;
  }

  return legacyDeviceConditionalExpression.conditionalAvailabilityExpression ===
    conditionalAvailabilityExpression
    ? null
    : legacyDeviceConditionalExpression.legacyConditionalDisplay;
};
