import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCurrentCommandMenuContextApi } from '@/command-menu-item/hooks/useCurrentCommandMenuContextApi';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { navigationMenuItemsSelector } from '@/navigation-menu-item/common/states/navigationMenuItemsSelector';
import { NavigationMenuItemPinnedCommand } from '@/navigation-menu-item/display/command/components/NavigationMenuItemPinnedCommand';
import { PINNED_COMMANDS_COMMAND_MENU_INSTANCE_ID } from '@/navigation-menu-item/display/command/constants/PinnedCommandsCommandMenuInstanceId';
import { getPinnedCommands } from '@/navigation-menu-item/display/command/utils/getPinnedCommands';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useMemo } from 'react';

export const NavigationMenuItemPinnedCommands = () => {
  const navigationMenuItems = useAtomStateValue(navigationMenuItemsSelector);
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const commandMenuContextApi = useCurrentCommandMenuContextApi();

  const pinnedCommands = useMemo(
    () =>
      getPinnedCommands({
        navigationMenuItems,
        commandMenuItems,
        commandMenuContextApi,
      }),
    [navigationMenuItems, commandMenuItems, commandMenuContextApi],
  );

  return (
    <CommandMenuComponentInstanceContext.Provider
      value={{ instanceId: PINNED_COMMANDS_COMMAND_MENU_INSTANCE_ID }}
    >
      <CommandMenuContext.Provider
        value={{
          displayType: 'listItem',
          containerType: CommandMenuItemContainerType.NavigationDrawer,
          commandMenuItems: pinnedCommands.map(
            ({ commandMenuItem }) => commandMenuItem,
          ),
          commandMenuContextApi,
          isInPreviewMode: false,
        }}
      >
        {pinnedCommands.map(({ navigationMenuItemId, commandMenuItem }) => (
          <NavigationMenuItemPinnedCommand
            key={navigationMenuItemId}
            commandMenuItem={commandMenuItem}
          />
        ))}
      </CommandMenuContext.Provider>
    </CommandMenuComponentInstanceContext.Provider>
  );
};
