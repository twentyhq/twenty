import { SETTINGS_PAGE_COMMAND_MENU_INSTANCE_ID } from '@/command-menu-item/constants/SettingsPageCommandMenuInstanceId';
import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { PinnedCommandMenuItemButtons } from '@/command-menu-item/display/components/PinnedCommandMenuItemButtons';
import { CommandMenuItemEditButton } from '@/command-menu-item/edit/components/CommandMenuItemEditButton';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const SettingsPageCommandMenu = () => {
  const isInMainSurface = useWorkspaceSurface().type === 'main';

  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const pinnedCommandMenuItems = (
    <CommandMenuContextProvider
      displayType="button"
      containerType={CommandMenuItemContainerType.IndexPageHeader}
      isInPreviewMode={isLayoutCustomizationModeEnabled && isInMainSurface}
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
      <CommandMenuItemEditButton />
    </CommandMenuComponentInstanceContext.Provider>
  );
};
