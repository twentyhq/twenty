import { isDefined } from 'twenty-shared/utils';

import { buildNavigationConditionalAvailabilityExpression } from 'src/database/commands/upgrade-version-command/utils/build-navigation-conditional-availability-expression.util';
import { STANDARD_COMMAND_MENU_ITEM_CONDITIONAL_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/utils/standard-command-menu-item-conditional-expressions.constant';
import { STANDARD_PAGE_LAYOUT_WIDGET_CONDITIONAL_AVAILABILITY_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/utils/standard-page-layout-widget-conditional-availability-expressions.constant';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';

export const fillStandardConditionalExpressions = (
  allFlatEntityMaps: TwentyStandardAllFlatEntityMaps,
): TwentyStandardAllFlatEntityMaps => {
  const {
    flatCommandMenuItemMaps,
    flatPageLayoutWidgetMaps,
    flatObjectMetadataMaps,
  } = allFlatEntityMaps;

  const filledFlatCommandMenuItems = Object.values(
    flatCommandMenuItemMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .map((flatCommandMenuItem): FlatCommandMenuItem => {
      const conditionalExpressions =
        STANDARD_COMMAND_MENU_ITEM_CONDITIONAL_EXPRESSIONS[
          flatCommandMenuItem.universalIdentifier
        ];
      const navigationTargetFlatObjectMetadata =
        flatCommandMenuItem.engineComponentKey ===
          EngineComponentKey.NAVIGATION &&
        isDefined(
          flatCommandMenuItem.navigationTargetObjectMetadataUniversalIdentifier,
        )
          ? flatObjectMetadataMaps.byUniversalIdentifier[
              flatCommandMenuItem
                .navigationTargetObjectMetadataUniversalIdentifier
            ]
          : undefined;

      return {
        ...flatCommandMenuItem,
        conditionalAvailabilityExpression: isDefined(
          navigationTargetFlatObjectMetadata,
        )
          ? buildNavigationConditionalAvailabilityExpression({
              universalIdentifier:
                navigationTargetFlatObjectMetadata.universalIdentifier,
              nameSingular: navigationTargetFlatObjectMetadata.nameSingular,
            })
          : (conditionalExpressions?.conditionalAvailabilityExpression ?? null),
        conditionalPinnedExpression:
          conditionalExpressions?.conditionalPinnedExpression ?? null,
      };
    });

  const filledFlatPageLayoutWidgets = Object.values(
    flatPageLayoutWidgetMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .map(
      (flatPageLayoutWidget): FlatPageLayoutWidget => ({
        ...flatPageLayoutWidget,
        conditionalAvailabilityExpression:
          STANDARD_PAGE_LAYOUT_WIDGET_CONDITIONAL_AVAILABILITY_EXPRESSIONS[
            flatPageLayoutWidget.universalIdentifier
          ] ?? null,
      }),
    );

  return {
    ...allFlatEntityMaps,
    flatCommandMenuItemMaps: {
      ...flatCommandMenuItemMaps,
      byUniversalIdentifier: Object.fromEntries(
        filledFlatCommandMenuItems.map((flatCommandMenuItem) => [
          flatCommandMenuItem.universalIdentifier,
          flatCommandMenuItem,
        ]),
      ),
    },
    flatPageLayoutWidgetMaps: {
      ...flatPageLayoutWidgetMaps,
      byUniversalIdentifier: Object.fromEntries(
        filledFlatPageLayoutWidgets.map((flatPageLayoutWidget) => [
          flatPageLayoutWidget.universalIdentifier,
          flatPageLayoutWidget,
        ]),
      ),
    },
  };
};
