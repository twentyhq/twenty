import { useLocation } from 'react-router-dom';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { getNavigationMenuItemColor } from '@/navigation-menu-item/common/utils/getNavigationMenuItemColor';
import { getSystemNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/system/utils/getSystemNavigationMenuItemComputedLink';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemSystemDisplayProps =
  NavigationMenuItemSectionContentProps;

export const NavigationMenuItemSystemDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemSystemDisplayProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );

  const { getIcon } = useIcons();
  const location = useLocation();

  const label = item.name ?? '';
  const computedLink = getSystemNavigationMenuItemComputedLink(item);
  const itemColor = getNavigationMenuItemColor(item);

  const Icon = isDefined(item.icon) ? getIcon(item.icon) : undefined;
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
      Icon={Icon}
      iconColor={itemColor}
      active={isActive}
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions}
    />
  );
};
