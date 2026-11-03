import { useLocation } from 'react-router-dom';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { useAutomationNavigationMenuItemTarget } from '@/navigation-menu-item/display/automation/hooks/useAutomationNavigationMenuItemTarget';
import { getAutomationNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/automation/utils/getAutomationNavigationMenuItemComputedLink';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemAutomationDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemAutomationDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemAutomationDisplayProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const location = useLocation();

  const { label, isMissing } = useAutomationNavigationMenuItemTarget(item);
  const computedLink = getAutomationNavigationMenuItemComputedLink(item);

  if (isMissing) {
    return null;
  }

  const isActive = computedLink !== '' && location.pathname === computedLink;

  return (
    <NavigationDrawerItem
      label={label}
      to={
        isLayoutCustomizationModeEnabled || isDragging
          ? undefined
          : computedLink
      }
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps?.onEditModeClick
          : undefined
      }
      Icon={() => <NavigationMenuItemIcon navigationMenuItem={item} />}
      active={isActive}
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions}
    />
  );
};
