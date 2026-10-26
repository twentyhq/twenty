import { SETTINGS_PAGE_COMMAND_MENU_INSTANCE_ID } from '@/command-menu-item/constants/SettingsPageCommandMenuInstanceId';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { PAGE_COMMAND_ENGINE_COMPONENT_KEYS } from '@/command-menu-item/page-command/constants/PageCommandEngineComponentKeys';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useContext } from 'react';

const SettingsPagePinnedCommandMenuItemButtons = () => {
  const commandMenuContext = useContext(CommandMenuContext);

  return (
    <CommandMenuContext.Provider
      value={{
        ...commandMenuContext,
        commandMenuItems: commandMenuContext.commandMenuItems.filter(
          ({ engineComponentKey }) =>
            PAGE_COMMAND_ENGINE_COMPONENT_KEYS.has(engineComponentKey),
        ),
      }}
    >
      <PinnedCommandMenuItemButtons />
    </CommandMenuContext.Provider>
  );
};

export const SettingsPageCommandMenu = () => {
  const isInMainSurface = useWorkspaceSurface().type === 'main';

  const pinnedCommandMenuItems = (
    <CommandMenuContextProvider
      displayType="button"
      containerType={CommandMenuItemContainerType.IndexPageHeader}
    >
      <SettingsPagePinnedCommandMenuItemButtons />
    </CommandMenuContextProvider>
  );

  if (!isInMainSurface) {
    return pinnedCommandMenuItems;
  }

  return (
    <CommandMenuComponentInstanceContext.Provider
      value={{ instanceId: SETTINGS_PAGE_COMMAND_MENU_INSTANCE_ID }}
    >
      {pinnedCommandMenuItems}
    </CommandMenuComponentInstanceContext.Provider>
  );
};
