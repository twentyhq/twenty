import { fastDeepEqual, isDefined } from 'twenty-shared/utils';

import { compileLegacyConditionalExpression } from 'src/database/commands/upgrade-version-command/2-56/utils/compile-legacy-conditional-expression.util';
import { findLegacyDeviceConditionalExpression } from 'src/database/commands/upgrade-version-command/2-56/utils/find-legacy-device-conditional-expression.util';
import { type LegacyWidgetJsonLogicField } from 'src/engine/metadata-modules/flat-conditional-display/types/legacy-widget-json-logic-field.type';
import { compileLegacyWidgetJsonLogic } from 'src/engine/metadata-modules/flat-conditional-display/utils/compile-legacy-widget-json-logic.util';
import { isConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/is-conditional-display.util';
import { isLegacyJsonLogicConditionalDisplay } from 'src/engine/metadata-modules/flat-conditional-display/utils/is-legacy-json-logic-conditional-display.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

export const migratePageLayoutWidgetConditionalDisplay = ({
  conditionalAvailabilityExpression,
  conditionalAvailability,
  conditionalDisplay,
  resolveField,
}: {
  conditionalAvailabilityExpression: string | null | undefined;
  conditionalAvailability: FlatPageLayoutWidget['conditionalAvailability'];
  conditionalDisplay: FlatPageLayoutWidget['conditionalDisplay'];
  resolveField: (fieldName: string) => LegacyWidgetJsonLogicField | undefined;
}): {
  conditionalAvailability: FlatPageLayoutWidget['conditionalAvailability'];
  conditionalDisplay: FlatPageLayoutWidget['conditionalDisplay'];
  conditionalDisplayConversion: 'none' | 'jsonLogic' | 'deviceExpression';
} => {
  const legacyDeviceConditionalExpression =
    findLegacyDeviceConditionalExpression(conditionalAvailabilityExpression);

  if (isDefined(legacyDeviceConditionalExpression)) {
    if (isConditionalDisplay(conditionalDisplay)) {
      return {
        conditionalAvailability,
        conditionalDisplay,
        conditionalDisplayConversion: 'none',
      };
    }

    if (
      isDefined(conditionalDisplay) &&
      !fastDeepEqual(
        conditionalDisplay,
        legacyDeviceConditionalExpression.legacyConditionalDisplay,
      )
    ) {
      throw new Error(
        `device expression "${conditionalAvailabilityExpression}" cannot replace the conditional display ${JSON.stringify(conditionalDisplay)}`,
      );
    }

    return {
      conditionalAvailability,
      conditionalDisplay: legacyDeviceConditionalExpression.conditionalDisplay,
      conditionalDisplayConversion: 'deviceExpression',
    };
  }

  const migratedConditionalAvailability =
    conditionalAvailability ??
    compileLegacyConditionalExpression(conditionalAvailabilityExpression);

  if (!isLegacyJsonLogicConditionalDisplay(conditionalDisplay)) {
    return {
      conditionalAvailability: migratedConditionalAvailability,
      conditionalDisplay,
      conditionalDisplayConversion: 'none',
    };
  }

  return {
    conditionalAvailability: migratedConditionalAvailability,
    conditionalDisplay: compileLegacyWidgetJsonLogic({
      jsonLogic: conditionalDisplay,
      resolveField,
    }),
    conditionalDisplayConversion: 'jsonLogic',
  };
};
