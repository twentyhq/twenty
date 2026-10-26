import { CommandMenuContextProvider } from '@/command-menu-item/contexts/CommandMenuContextProvider';
import { CommandMenuItemContainerType } from '@/command-menu-item/types/CommandMenuItemContainerType';
import { CommandMenuComponentInstanceContext } from '@/command-menu/states/contexts/CommandMenuComponentInstanceContext';
import { NAVIGATION_MENU_COMMAND_MENU_INSTANCE_ID } from '@/navigation-menu-item/common/constants/NavigationMenuCommandMenuInstanceId';
import { NavigationMenuItemCommandDisplayContent } from '@/navigation-menu-item/display/command/components/NavigationMenuItemCommandDisplayContent';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';

type NavigationMenuItemCommandDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemCommandDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemCommandDisplayProps) => (
  <CommandMenuComponentInstanceContext.Provider
    value={{ instanceId: NAVIGATION_MENU_COMMAND_MENU_INSTANCE_ID }}
  >
    <CommandMenuContextProvider
      displayType="listItem"
      containerType={CommandMenuItemContainerType.NavigationDrawer}
    >
      <NavigationMenuItemCommandDisplayContent
        item={item}
        editModeProps={editModeProps}
        isDragging={isDragging}
        rightOptions={rightOptions}
      />
    </CommandMenuContextProvider>
  </CommandMenuComponentInstanceContext.Provider>
);
