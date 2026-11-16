import { isAutomationNavigationMenuItemType } from '@/navigation-menu-item/common/utils/isAutomationNavigationMenuItemType';
import { NavigationMenuItemAutomationFolderSubItem } from '@/navigation-menu-item/display/automation/components/NavigationMenuItemAutomationFolderSubItem';
import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { type NavigationMenuItemFolderSubItemProps } from '@/navigation-menu-item/display/folder/types/NavigationMenuItemFolderSubItemProps';

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
  isAutomationNavigationMenuItemType(navigationMenuItem.type) ? (
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
