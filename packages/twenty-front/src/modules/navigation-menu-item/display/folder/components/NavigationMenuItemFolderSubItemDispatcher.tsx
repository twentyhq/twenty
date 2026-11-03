import { AUTOMATION_NAVIGATION_MENU_ITEM_TYPES } from '@/navigation-menu-item/common/constants/AutomationNavigationMenuItemTypes';
import { NavigationMenuItemAutomationFolderSubItem } from '@/navigation-menu-item/display/automation/components/NavigationMenuItemAutomationFolderSubItem';
import {
  NavigationMenuItemFolderSubItem,
  type NavigationMenuItemFolderSubItemProps,
} from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';

type NavigationMenuItemFolderSubItemDispatcherProps = Omit<
  NavigationMenuItemFolderSubItemProps,
  'label'
>;

export const NavigationMenuItemFolderSubItemDispatcher = ({
  navigationMenuItem,
  index,
  arrayLength,
  selectedIndex,
  isDragging,
  rightOptions,
  onClick,
  onNavigationMenuItemClick,
}: NavigationMenuItemFolderSubItemDispatcherProps) =>
  AUTOMATION_NAVIGATION_MENU_ITEM_TYPES.includes(navigationMenuItem.type) ? (
    <NavigationMenuItemAutomationFolderSubItem
      navigationMenuItem={navigationMenuItem}
      index={index}
      arrayLength={arrayLength}
      selectedIndex={selectedIndex}
      isDragging={isDragging}
      rightOptions={rightOptions}
      onClick={onClick}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
    />
  ) : (
    <NavigationMenuItemFolderSubItem
      navigationMenuItem={navigationMenuItem}
      index={index}
      arrayLength={arrayLength}
      selectedIndex={selectedIndex}
      isDragging={isDragging}
      rightOptions={rightOptions}
      onClick={onClick}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
    />
  );
