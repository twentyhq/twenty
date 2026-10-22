import { parsePath, useNavigate } from 'react-router-dom';
import { isSafeInternalPath } from 'twenty-shared/utils';
import { IconArrowUpRight } from 'twenty-ui/icon';
import { useTheme, themeCssVariables } from 'twenty-ui/theme';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuItemIcon } from '@/navigation-menu-item/display/components/NavigationMenuItemIcon';
import { useIdentifyActiveNavigationMenuItems } from '@/navigation-menu-item/display/hooks/useIdentifyActiveNavigationMenuItems';
import { getLinkNavigationMenuItemComputedLink } from '@/navigation-menu-item/common/utils/getLinkNavigationMenuItemComputedLink';
import { getLinkNavigationMenuItemLabel } from '@/navigation-menu-item/display/link/utils/getLinkNavigationMenuItemLabel';
import type { NavigationMenuItemSectionContentProps } from '@/navigation-menu-item/display/sections/types/NavigationMenuItemSectionContentProps';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { settingsPathOpenedFromNavigationMenuState } from '@/navigation/states/settingsPathOpenedFromNavigationMenuState';
import { isSettingsPath } from '~/utils/isSettingsPath';

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
  const theme = useTheme();
  const navigate = useNavigate();
  const setSettingsPathOpenedFromNavigationMenu = useSetAtomState(
    settingsPathOpenedFromNavigationMenuState,
  );

  const { activeNavigationMenuItemIds } =
    useIdentifyActiveNavigationMenuItems();

  const label = getLinkNavigationMenuItemLabel(item);
  const computedLink = getLinkNavigationMenuItemComputedLink(item);
  const isInternalLink = isSafeInternalPath(computedLink);
  const settingsPathname = isInternalLink
    ? parsePath(computedLink).pathname
    : undefined;
  const isSettingsLink =
    settingsPathname !== undefined && isSettingsPath(settingsPathname);

  const openSettingsLinkInNavigationMenu = () => {
    setSettingsPathOpenedFromNavigationMenu(settingsPathname ?? null);
    navigate(computedLink);
  };

  const defaultRightOptions = !isLayoutCustomizationModeEnabled &&
    !isInternalLink && (
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
        isLayoutCustomizationModeEnabled || isDragging
          ? undefined
          : computedLink
      }
      onClick={
        isLayoutCustomizationModeEnabled
          ? editModeProps?.onEditModeClick
          : isSettingsLink && !isDragging
            ? openSettingsLinkInNavigationMenu
            : undefined
      }
      Icon={() => <NavigationMenuItemIcon navigationMenuItem={item} />}
      active={activeNavigationMenuItemIds.includes(item.id)}
      isSelectedInEditMode={editModeProps?.isSelectedInEditMode}
      isDragging={isDragging}
      triggerEvent="CLICK"
      rightOptions={rightOptions ?? defaultRightOptions}
    />
  );
};
