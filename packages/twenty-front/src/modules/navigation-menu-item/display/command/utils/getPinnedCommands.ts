import { type PinnedCommand } from '@/navigation-menu-item/display/command/types/PinnedCommand';
import {
  type CommandMenuContextApi,
  NavigationMenuItemType,
} from 'twenty-shared/types';
import {
  evaluateConditionalAvailabilityExpression,
  isDefined,
} from 'twenty-shared/utils';
import {
  CommandMenuItemAvailabilityType,
  type CommandMenuItemFieldsFragment,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

export const getPinnedCommands = ({
  navigationMenuItems,
  commandMenuItems,
  commandMenuContextApi,
}: {
  navigationMenuItems: Pick<
    NavigationMenuItem,
    'id' | 'type' | 'parentId' | 'commandMenuItemId' | 'position'
  >[];
  commandMenuItems: CommandMenuItemFieldsFragment[];
  commandMenuContextApi: CommandMenuContextApi;
}): PinnedCommand[] => {
  const commandMenuItemsById = new Map(
    commandMenuItems.map((commandMenuItem) => [
      commandMenuItem.id,
      commandMenuItem,
    ]),
  );

  return navigationMenuItems
    .filter(
      (navigationMenuItem) =>
        navigationMenuItem.type === NavigationMenuItemType.COMMAND &&
        !isDefined(navigationMenuItem.parentId),
    )
    .sort((first, second) => first.position - second.position)
    .flatMap((navigationMenuItem) => {
      const commandMenuItem = isDefined(navigationMenuItem.commandMenuItemId)
        ? commandMenuItemsById.get(navigationMenuItem.commandMenuItemId)
        : undefined;

      if (
        !isDefined(commandMenuItem) ||
        commandMenuItem.availabilityType !==
          CommandMenuItemAvailabilityType.GLOBAL ||
        !evaluateConditionalAvailabilityExpression(
          commandMenuItem.conditionalAvailabilityExpression,
          commandMenuContextApi,
        )
      ) {
        return [];
      }

      return [{ navigationMenuItemId: navigationMenuItem.id, commandMenuItem }];
    });
};
