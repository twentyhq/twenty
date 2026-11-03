import { useAutomationNavigationMenuItemTarget } from '@/navigation-menu-item/display/automation/hooks/useAutomationNavigationMenuItemTarget';
import {
  NavigationMenuItemFolderSubItem,
  type NavigationMenuItemFolderSubItemProps,
} from '@/navigation-menu-item/display/folder/components/NavigationMenuItemFolderSubItem';

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
  const { label, isMissing } =
    useAutomationNavigationMenuItemTarget(navigationMenuItem);

  if (isMissing) {
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
