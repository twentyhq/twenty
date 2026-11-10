import { useAutomationNavigationMenuItemTarget } from '@/navigation-menu-item/display/automation/hooks/useAutomationNavigationMenuItemTarget';
import { NavigationMenuItemFolderSubItem } from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';
import { type NavigationMenuItemFolderSubItemProps } from '@/navigation-menu-item/display/folder/types/NavigationMenuItemFolderSubItemProps';

type NavigationMenuItemAutomationFolderSubItemProps = Omit<
  NavigationMenuItemFolderSubItemProps,
  'label'
>;

export const NavigationMenuItemAutomationFolderSubItem = ({
  navigationMenuItem,
  index,
  arrayLength,
  selectedIndex,
  isDragging,
  rightOptions,
  onClick,
  onNavigationMenuItemClick,
}: NavigationMenuItemAutomationFolderSubItemProps) => {
  const { label, isUnavailable } =
    useAutomationNavigationMenuItemTarget(navigationMenuItem);

  if (isUnavailable) {
    return null;
  }

  return (
    <NavigationMenuItemFolderSubItem
      navigationMenuItem={navigationMenuItem}
      label={label}
      index={index}
      arrayLength={arrayLength}
      selectedIndex={selectedIndex}
      isDragging={isDragging}
      rightOptions={rightOptions}
      onClick={onClick}
      onNavigationMenuItemClick={onNavigationMenuItemClick}
    />
  );
};
