import { useContext } from 'react';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { isNavigationMenuItemSearch } from '@/navigation-menu-item/common/utils/isNavigationMenuItemSearch';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemComputedLink';
import { getLinkNavigationMenuItemLabel } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemLabel';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { useOpenRecordsSearchPageInSidePanel } from '@/side-panel/hooks/useOpenRecordsSearchPageInSidePanel';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type NavigationMenuItemLinkDisplayProps = NavigationMenuItemSectionContentProps;

export const NavigationMenuItemLinkDisplay = ({
  item,
  editModeProps,
  isDragging,
  rightOptions,
}: NavigationMenuItemLinkDisplayProps) => {
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const { theme } = useContext(ThemeContext);
  const { openRecordsSearchPage } = useOpenRecordsSearchPageInSidePanel();

  const label = getLinkNavigationMenuItemLabel(item);
  const computedLink = getLinkNavigationMenuItemComputedLink(item);
  const isSearchNavigationMenuItem = isNavigationMenuItemSearch(item);

  const defaultRightOptions = !isLayoutCustomizationModeEnabled &&
    !isSearchNavigationMenuItem && (
      <IconArrowUpRight
        size={theme.icon.size.sm}
        stroke={theme.icon.stroke.md}
        color={themeCssVariables.font.color.light}
      />
    );

  return (
    <NavigationDrawerItem
      label={label}
      to={
        isLayoutCustomizationModeEnabled ||
        isDragging ||
        isSearchNavigationMenuItem
          ? undefined
          : computedLink
      }
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps?.onEditModeClick
          : isSearchNavigationMenuItem
            ? openRecordsSearchPage
            : undefined
      }
      Icon={() => <NavigationMenuItemIcon navigationMenuItem={item} />}
      active={false}
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions ?? defaultRightOptions}
    />
  );
};
