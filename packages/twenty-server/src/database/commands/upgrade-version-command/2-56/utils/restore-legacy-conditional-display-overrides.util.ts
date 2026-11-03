import { isDefined } from 'twenty-shared/utils';

import { findLegacyDeviceConditionalExpressionByConditionalDisplay } from 'src/database/commands/upgrade-version-command/2-56/utils/find-legacy-device-conditional-expression-by-conditional-display.util';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { mapAuthoredOverrideEntries } from 'src/engine/metadata-modules/overrides/utils/map-authored-override-entries.util';

export const restoreLegacyConditionalDisplayOverrides = (
  overrides: FlatPageLayoutWidget['overrides'],
): FlatPageLayoutWidget['overrides'] =>
  isDefined(overrides)
    ? mapAuthoredOverrideEntries({
        metadataName: 'pageLayoutWidget',
        overrides,
        mapEntry: (entry) => {
          const legacyDeviceConditionalExpression =
            findLegacyDeviceConditionalExpressionByConditionalDisplay(
              entry.conditionalDisplay,
            );

          return isDefined(legacyDeviceConditionalExpression)
            ? {
                ...entry,
                conditionalDisplay:
                  legacyDeviceConditionalExpression.legacyConditionalDisplay,
              }
            : entry;
        },
      })
    : overrides;
