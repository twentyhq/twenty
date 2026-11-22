import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { commandMenuItemsSelector } from '@/command-menu-item/states/commandMenuItemsSelector';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { NavigationMenuItemPinnedCommand } from '@/navigation-menu-item/display/command/components/NavigationMenuItemPinnedCommand';
import { PINNED_COMMANDS_COMMAND_MENU_INSTANCE_ID } from '@/navigation-menu-item/display/command/constants/PinnedCommandsCommandMenuInstanceId';
import { getPinnedCommands } from '@/navigation-menu-item/display/command/utils/getPinnedCommands';
import { useNavigationMenuItemsData } from '@/navigation-menu-item/display/hooks/useNavigationMenuItemsData';
import { NavigationMenuItemPinnedCommandAddButton } from '@/navigation-menu-item/edit/components/NavigationMenuItemPinnedCommandAddButton';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useContext, useMemo } from 'react';

const NavigationMenuItemPinnedCommandList = () => {
  const { commandMenuItems: availableCommandMenuItems } =
    useContext(CommandMenuContext);
  const commandMenuItems = useAtomStateValue(commandMenuItemsSelector);
  const { workspaceNavigationMenuItems } = useNavigationMenuItemsData();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const pinnedCommands = useMemo(
    () =>
      getPinnedCommands({
        navigationMenuItems: workspaceNavigationMenuItems,
        commandMenuItems: isLayoutCustomizationModeEnabled
          ? commandMenuItems
          : availableCommandMenuItems,
      }),
    [
      workspaceNavigationMenuItems,
      isLayoutCustomizationModeEnabled,
      commandMenuItems,
      availableCommandMenuItems,
    ],
  );

  return (
    <>
      {pinnedCommands.map(({ navigationMenuItemId, commandMenuItem }) => (
        <NavigationMenuItemPinnedCommand
          key={navigationMenuItemId}
          navigationMenuItemId={navigationMenuItemId}
          commandMenuItem={commandMenuItem}
          isEditing={isLayoutCustomizationModeEnabled}
        />
      ))}
      {isLayoutCustomizationModeEnabled && (
        <NavigationMenuItemPinnedCommandAddButton />
      )}
    </>
  );
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
