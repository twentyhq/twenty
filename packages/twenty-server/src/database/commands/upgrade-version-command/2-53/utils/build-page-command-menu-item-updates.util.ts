import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';

const PIN_LOCKED_DASHBOARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS = [
  STANDARD_COMMAND_MENU_ITEMS.saveDashboardLayout.universalIdentifier,
  STANDARD_COMMAND_MENU_ITEMS.cancelDashboardLayout.universalIdentifier,
];

export const buildPageCommandMenuItemUpdates = ({
  flatCommandMenuItemMaps,
  direction,
  now,
}: {
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  direction: 'up' | 'down';
  now: string;
}): FlatCommandMenuItem[] => {
  const isPinLocked = direction === 'up';

  return PIN_LOCKED_DASHBOARD_COMMAND_MENU_ITEM_UNIVERSAL_IDENTIFIERS.flatMap(
    (universalIdentifier) => {
      const commandMenuItem =
        flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier];

      if (
        !isDefined(commandMenuItem) ||
        commandMenuItem.applicationUniversalIdentifier !==
          TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER ||
        commandMenuItem.isPinLocked === isPinLocked
      ) {
        return [];
      }

      return [{ ...commandMenuItem, isPinLocked, updatedAt: now }];
    },
  );
};
