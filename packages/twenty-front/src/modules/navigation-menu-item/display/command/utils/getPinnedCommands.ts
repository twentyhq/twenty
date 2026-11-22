import { type PinnedCommand } from '@/navigation-menu-item/display/command/types/PinnedCommand';
import { getPinnedCommandNavigationMenuItems } from '@/navigation-menu-item/display/command/utils/getPinnedCommandNavigationMenuItems';
import { isDefined } from 'twenty-shared/utils';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

export const getPinnedCommands = ({
  navigationMenuItems,
  commandMenuItems,
}: {
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'id' | 'type' | 'parentId' | 'commandMenuItemId' | 'position' | 'isActive'
  >[];
  commandMenuItems: CommandMenuItemFieldsFragment[];
}): PinnedCommand[] => {
  const commandMenuItemsById = new Map(
    commandMenuItems.map((commandMenuItem) => [
      commandMenuItem.id,
      commandMenuItem,
    ]),
  );

  return getPinnedCommandNavigationMenuItems(navigationMenuItems).flatMap(
    (navigationMenuItem) => {
      const commandMenuItem = isDefined(navigationMenuItem.commandMenuItemId)
        ? commandMenuItemsById.get(navigationMenuItem.commandMenuItemId)
        : undefined;

      if (
        !isDefined(commandMenuItem) ||
        commandMenuItem.availabilityType !==
          CommandMenuItemAvailabilityType.GLOBAL
      ) {
        return [];
      }

      return [{ navigationMenuItemId: navigationMenuItem.id, commandMenuItem }];
    },
  );
};
