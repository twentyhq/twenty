import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { NavigationMenuItemPinnedCommand } from '@/navigation-menu-item/display/command/components/NavigationMenuItemPinnedCommand';
import { PINNED_COMMANDS_COMMAND_MENU_INSTANCE_ID } from '@/navigation-menu-item/display/command/constants/PinnedCommandsCommandMenuInstanceId';
import { getPinnedCommands } from '@/navigation-menu-item/display/command/utils/getPinnedCommands';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { useContext, useMemo } from 'react';

const NavigationMenuItemPinnedCommandList = () => {
  const { commandMenuItems } = useContext(CommandMenuContext);
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();

  const pinnedCommands = useMemo(
    () =>
      getPinnedCommands({
        navigationMenuItems: workspaceNavigationMenuItems,
        commandMenuItems,
      }),
    [workspaceNavigationMenuItems, commandMenuItems],
  );

  return pinnedCommands.map(({ navigationMenuItemId, commandMenuItem }) => (
    <NavigationMenuItemPinnedCommand
      key={navigationMenuItemId}
      commandMenuItem={commandMenuItem}
    />
  ));
};

export const NavigationMenuItemPinnedCommands = () => (
  <CommandMenuComponentInstanceContext.Provider
    value={{ instanceId: PINNED_COMMANDS_COMMAND_MENU_INSTANCE_ID }}
  >
    <CommandMenuContextProvider
      displayType="listItem"
      containerType={CommandMenuItemContainerType.NavigationDrawer}
    >
      <NavigationMenuItemPinnedCommandList />
    </CommandMenuContextProvider>
  </CommandMenuComponentInstanceContext.Provider>
);
