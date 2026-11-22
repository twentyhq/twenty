import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatNavigationMenuItem } from 'src/engine/metadata-modules/flat-navigation-menu-item/types/flat-navigation-menu-item.type';
import { STANDARD_NAVIGATION_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-navigation-menu-item.constant';
import { createStandardNavigationMenuItemCommandFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/navigation-menu-item/create-standard-navigation-menu-item-command-flat-metadata.util';

const PINNED_COMMAND_NAMES = ['searchCommand', 'newAiChatCommand'] as const;

export const buildMissingStandardPinnedCommandsToCreate = ({
  flatNavigationMenuItemMaps,
  flatCommandMenuItemMaps,
  workspaceId,
  twentyStandardApplicationId,
  now,
}: {
  flatNavigationMenuItemMaps: FlatEntityMaps<FlatNavigationMenuItem>;
  flatCommandMenuItemMaps: FlatEntityMaps<FlatCommandMenuItem>;
  workspaceId: string;
  twentyStandardApplicationId: string;
  now: string;
}): FlatNavigationMenuItem[] =>
  PINNED_COMMAND_NAMES.map(
    (pinnedCommandName) => STANDARD_NAVIGATION_MENU_ITEMS[pinnedCommandName],
  )
    .filter(
      ({ universalIdentifier }) =>
        !isDefined(
          flatNavigationMenuItemMaps.byUniversalIdentifier[universalIdentifier],
        ),
    )
    .map((pinnedCommandDefinition) =>
      createStandardNavigationMenuItemCommandFlatMetadata({
        universalIdentifier: pinnedCommandDefinition.universalIdentifier,
        commandMenuItemUniversalIdentifier:
          pinnedCommandDefinition.commandMenuItemUniversalIdentifier,
        position: pinnedCommandDefinition.position,
        navigationMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId,
        dependencyFlatEntityMaps: { flatCommandMenuItemMaps },
        now,
      }),
    )
    .filter(isDefined);
