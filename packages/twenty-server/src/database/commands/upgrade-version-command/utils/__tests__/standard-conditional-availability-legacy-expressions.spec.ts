import {
  compileConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';

import { LEGACY_DEVICE_CONDITIONAL_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/2-56/constants/legacy-device-conditional-expressions.constant';
import { STANDARD_COMMAND_MENU_ITEM_CONDITIONAL_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/utils/standard-command-menu-item-conditional-expressions.constant';
import { STANDARD_PAGE_LAYOUT_WIDGET_CONDITIONAL_AVAILABILITY_EXPRESSIONS } from 'src/database/commands/upgrade-version-command/utils/standard-page-layout-widget-conditional-availability-expressions.constant';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';

const compileLegacyExpression = (expression: string | undefined) =>
  isDefined(expression)
    ? compileConditionalAvailabilityExpression(expression)
    : null;

const standardFlatPageLayoutWidgets = Object.values(
  computeTwentyStandardApplicationAllFlatEntityMaps({
    now: new Date().toISOString(),
    workspaceId: '20202020-0000-4000-8000-000000000001',
    twentyStandardApplicationId: '20202020-0000-4000-8000-000000000002',
    isWorkspaceCreation: true,
  }).allFlatEntityMaps.flatPageLayoutWidgetMaps.byUniversalIdentifier,
).filter(isDefined);

describe('standard conditional availability legacy expressions', () => {
  it('compile to the trees declared on command menu items', () => {
    Object.values(STANDARD_COMMAND_MENU_ITEMS).forEach((definition) => {
      const conditionalExpressions =
        STANDARD_COMMAND_MENU_ITEM_CONDITIONAL_EXPRESSIONS[
          definition.universalIdentifier
        ] ?? {};

      expect({
        universalIdentifier: definition.universalIdentifier,
        conditionalAvailability: compileLegacyExpression(
          conditionalExpressions.conditionalAvailabilityExpression,
        ),
        conditionalPinned: compileLegacyExpression(
          conditionalExpressions.conditionalPinnedExpression,
        ),
      }).toEqual({
        universalIdentifier: definition.universalIdentifier,
        conditionalAvailability: definition.conditionalAvailability ?? null,
        conditionalPinned:
          'conditionalPinned' in definition
            ? definition.conditionalPinned
            : null,
      });
    });
  });

  it('only key command menu items that exist', () => {
    const standardCommandMenuItemUniversalIdentifiers: string[] = Object.values(
      STANDARD_COMMAND_MENU_ITEMS,
    ).map(({ universalIdentifier }) => universalIdentifier);

    expect(
      Object.keys(STANDARD_COMMAND_MENU_ITEM_CONDITIONAL_EXPRESSIONS).filter(
        (universalIdentifier) =>
          !standardCommandMenuItemUniversalIdentifiers.includes(
            universalIdentifier,
          ),
      ),
    ).toEqual([]);
  });

  it('compile to the trees declared on page layout widgets', () => {
    standardFlatPageLayoutWidgets.forEach((flatPageLayoutWidget) => {
      const conditionalAvailabilityExpression =
        STANDARD_PAGE_LAYOUT_WIDGET_CONDITIONAL_AVAILABILITY_EXPRESSIONS[
          flatPageLayoutWidget.universalIdentifier
        ];

      const legacyDeviceConditionalExpression =
        LEGACY_DEVICE_CONDITIONAL_EXPRESSIONS.find(
          (deviceConditionalExpression) =>
            deviceConditionalExpression.conditionalAvailabilityExpression ===
            conditionalAvailabilityExpression,
        );

      if (isDefined(legacyDeviceConditionalExpression)) {
        expect({
          universalIdentifier: flatPageLayoutWidget.universalIdentifier,
          conditionalAvailability: flatPageLayoutWidget.conditionalAvailability,
          conditionalDisplay: flatPageLayoutWidget.conditionalDisplay,
        }).toEqual({
          universalIdentifier: flatPageLayoutWidget.universalIdentifier,
          conditionalAvailability: null,
          conditionalDisplay:
            legacyDeviceConditionalExpression.conditionalDisplay,
        });

        return;
      }

      expect({
        universalIdentifier: flatPageLayoutWidget.universalIdentifier,
        conditionalAvailability: compileLegacyExpression(
          conditionalAvailabilityExpression,
        ),
        conditionalDisplay: flatPageLayoutWidget.conditionalDisplay,
      }).toEqual({
        universalIdentifier: flatPageLayoutWidget.universalIdentifier,
        conditionalAvailability: flatPageLayoutWidget.conditionalAvailability,
        conditionalDisplay: null,
      });
    });
  });

  it('only key page layout widgets that exist', () => {
    const standardPageLayoutWidgetUniversalIdentifiers =
      standardFlatPageLayoutWidgets.map(
        ({ universalIdentifier }) => universalIdentifier,
      );

    expect(
      Object.keys(
        STANDARD_PAGE_LAYOUT_WIDGET_CONDITIONAL_AVAILABILITY_EXPRESSIONS,
      ).filter(
        (universalIdentifier) =>
          !standardPageLayoutWidgetUniversalIdentifiers.includes(
            universalIdentifier,
          ),
      ),
    ).toEqual([]);
  });
});
