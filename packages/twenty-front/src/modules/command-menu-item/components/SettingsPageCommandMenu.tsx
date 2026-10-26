import { SETTINGS_PAGE_COMMAND_MENU_INSTANCE_ID } from '@/command-menu-item/constants/SettingsPageCommandMenuInstanceId';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';

export const SettingsPageCommandMenu = () => {
  const isInMainSurface = useWorkspaceSurface().type === 'main';

  const pinnedCommandMenuItems = (
    <CommandMenuContextProvider
      displayType="button"
      containerType={CommandMenuItemContainerType.IndexPageHeader}
    >
      <PinnedCommandMenuItemButtons />
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
