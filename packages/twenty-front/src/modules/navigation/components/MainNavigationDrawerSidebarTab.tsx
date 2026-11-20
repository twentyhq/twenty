import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useRef, useState } from 'react';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables } from 'twenty-ui/theme';

import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { NavigationMenuTabCustomizeMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuTabCustomizeMenuContent';
import { NavigationMenuTabMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuTabMenuContent';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { MainNavigationDrawerTab } from '@/navigation/components/MainNavigationDrawerTab';
import { useSwitchNavigationDrawerTab } from '@/navigation/hooks/useSwitchNavigationDrawerTab';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { isDropdownOpenComponentState } from '@/ui/layout/dropdown/states/isDropdownOpenComponentState';
import { StyledNavigationDrawerUnreadDot } from '@/ui/navigation/navigation-drawer/components/StyledNavigationDrawerUnreadDot';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledUnreadDot = styled(StyledNavigationDrawerUnreadDot)`
  background: ${themeCssVariables.color.red};
`;

const StyledAnchor = styled.span`
  display: flex;
  min-width: 0;
`;

type MainNavigationDrawerSidebarTabProps = {
  tab: Pick<NamedNavigationMenuItem, 'id' | 'name' | 'icon'>;
  isActive: boolean;
  isExpanded: boolean;
  shouldShowTooltip: boolean;
  isUnread: boolean;
};

export const MainNavigationDrawerSidebarTab = ({
  tab,
  isActive,
  isExpanded,
  shouldShowTooltip,
  isUnread,
}: MainNavigationDrawerSidebarTabProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();
  const canOpenTabMenu =
    hasLayoutsPermission &&
    (isLayoutCustomizationModeEnabled ||
      isLayoutCustomizationAllowedOnCurrentPage);
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const { switchToNavigationMenuTab } = useSwitchNavigationDrawerTab();
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const [wasTabMenuOpenOnPointerDown, setWasTabMenuOpenOnPointerDown] =
    useState(false);
  const dropdownId = `navigation-menu-tab-menu-${tab.id}`;
  const isDropdownOpen = useAtomComponentStateValue(
    isDropdownOpenComponentState,
    dropdownId,
  );

  const openTabMenu = () =>
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });

  const handleClick = () => {
    if (!isActive || !canOpenTabMenu) {
      switchToNavigationMenuTab(tab.id);
      return;
    }

    if (wasTabMenuOpenOnPointerDown) {
      closeDropdown(dropdownId);
      return;
    }

    openTabMenu();
  };

  const handleContextMenu = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();

    if (isLayoutCustomizationModeEnabled && !isActive) {
      switchToNavigationMenuTab(tab.id);
    }

    openTabMenu();
  };

  const tabButton = (
    <MainNavigationDrawerTab
      Icon={getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT)}
      label={tab.name}
      isActive={isActive}
      isExpanded={isExpanded}
      isDisabled={false}
      tooltip={tab.name}
      shouldShowTooltip={shouldShowTooltip}
      onClick={handleClick}
      onContextMenu={canOpenTabMenu ? handleContextMenu : undefined}
      isSelectedInEditMode={isLayoutCustomizationModeEnabled && isDropdownOpen}
      ariaLabel={isUnread ? t`${tab.name}, unread` : tab.name}
      iconAccessory={isUnread && <StyledUnreadDot aria-hidden="true" />}
    />
  );

  if (!canOpenTabMenu) {
    return <StyledAnchor>{tabButton}</StyledAnchor>;
  }

  return (
    <DropdownRoot dropdownId={dropdownId} type="menu">
      {navigationMenuItemIdToRename === tab.id && (
        <NavigationMenuItemDropdownOpenEffect
          dropdownId={dropdownId}
          onOpen={() => setNavigationMenuItemIdToRename(null)}
        />
      )}
      <StyledAnchor
        ref={anchorRef}
        onPointerDown={() => setWasTabMenuOpenOnPointerDown(isDropdownOpen)}
      >
        {tabButton}
      </StyledAnchor>
      <DropdownContent
        anchor={anchorRef}
        side="bottom"
        align="start"
        width={GenericDropdownContentWidth.Large}
        aria-label={t`Tab actions`}
      >
        {isLayoutCustomizationModeEnabled ? (
          <NavigationMenuTabMenuContent tab={tab} />
        ) : (
          <NavigationMenuTabCustomizeMenuContent
            onClose={() => closeDropdown(dropdownId)}
          />
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
