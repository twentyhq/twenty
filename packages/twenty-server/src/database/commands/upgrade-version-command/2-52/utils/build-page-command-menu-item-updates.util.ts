import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined, typedObjectEntries } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const ASK_AI_PINNED_EXPRESSION = 'pageType != "SETTINGS_PAGE"';
const PREVIOUS_EDIT_LAYOUT_AVAILABILITY_EXPRESSION =
  'pageType != "SETTINGS_PAGE" and not isLayoutCustomizationModeEnabled and permissionFlags.LAYOUTS';
const EDIT_LAYOUT_AVAILABILITY_EXPRESSION =
  'not isLayoutCustomizationModeEnabled and permissionFlags.LAYOUTS';

export const buildPageCommandMenuItemUpdates = ({
  flatCommandMenuItemMaps,
  direction,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  direction: 'up' | 'down';
  now: string;
}): FlatCommandMenuItem[] => {
  const isUpgrade = direction === 'up';
  const updates: {
    universalIdentifier: string;
    target: Partial<FlatCommandMenuItem>;
  }[] = [
    {
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.askAi.universalIdentifier,
      target: {
        conditionalPinnedExpression: isUpgrade
          ? ASK_AI_PINNED_EXPRESSION
          : null,
      },
    },
    {
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.editRecordPageLayout.universalIdentifier,
      target: {
        conditionalAvailabilityExpression: isUpgrade
          ? EDIT_LAYOUT_AVAILABILITY_EXPRESSION
          : PREVIOUS_EDIT_LAYOUT_AVAILABILITY_EXPRESSION,
      },
    },
    {
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.saveDashboardLayout.universalIdentifier,
      target: { isPinLocked: isUpgrade },
    },
    {
      universalIdentifier:
        STANDARD_COMMAND_MENU_ITEMS.cancelDashboardLayout.universalIdentifier,
      target: { isPinLocked: isUpgrade },
    },
  ];

  return updates.flatMap(({ universalIdentifier, target }) => {
    const commandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier];

    if (
      !isDefined(commandMenuItem) ||
      commandMenuItem.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return [];
    }

    const isAlreadyUpdated = typedObjectEntries(target).every(
      ([key, value]) => commandMenuItem[key] === value,
    );

    if (isAlreadyUpdated) {
      return [];
    }

    return [{ ...commandMenuItem, ...target, updatedAt: now }];
  });
};
