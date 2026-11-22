import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { NavigationMenuItemType } from 'src/engine/metadata-modules/navigation-menu-item/enums/navigation-menu-item-type.enum';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardNavigationMenuItemCommandFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-command-flat-metadata.util';

const PINNED_COMMAND_NAMES = ['searchCommand', 'newAiChatCommand'] as const;

export const buildMissingStandardPinnedCommandsToCreate = ({
  flatNavigationMenuItemMaps,
  flatCommandMenuItemMaps,
  workspaceId,
  now,
}: {
  flatNavigationMenuItemMaps: FlatEntityMaps<FlatNavigationMenuItem>;
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  workspaceId: string;
  now: string;
}): FlatNavigationMenuItem[] => {
  const flatNavigationMenuItems = Object.values(
    flatNavigationMenuItemMaps.byUniversalIdentifier,
  ).filter(isDefined);

  const pinnedCommandMenuItemIds = new Set(
    flatNavigationMenuItems
      .filter(
        (flatNavigationMenuItem) =>
          flatNavigationMenuItem.type === NavigationMenuItemType.COMMAND &&
          !isDefined(flatNavigationMenuItem.userWorkspaceId),
      )
      .map(({ commandMenuItemId }) => commandMenuItemId),
  );

  return PINNED_COMMAND_NAMES.flatMap((pinnedCommandName) => {
    const pinnedCommandDefinition =
      STANDARD_NAVIGATION_MENU_ITEMS[pinnedCommandName];

    const flatCommandMenuItem = findFlatEntityByUniversalIdentifier({
      universalIdentifier:
        pinnedCommandDefinition.commandMenuItemUniversalIdentifier,
      flatEntityMaps: flatCommandMenuItemMaps,
    });

    const isAlreadyPinned =
      isDefined(
        flatNavigationMenuItemMaps.byUniversalIdentifier[
          pinnedCommandDefinition.universalIdentifier
        ],
      ) ||
      (isDefined(flatCommandMenuItem) &&
        pinnedCommandMenuItemIds.has(flatCommandMenuItem.id));

    if (!isDefined(flatCommandMenuItem) || isAlreadyPinned) {
      return [];
    }

    return [
      createStandardNavigationMenuItemCommandFlatMetadata({
        universalIdentifier: pinnedCommandDefinition.universalIdentifier,
        flatCommandMenuItem,
        position: pinnedCommandDefinition.position,
        navigationMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId: flatCommandMenuItem.applicationId,
        now,
      }),
    ];
  });
};
