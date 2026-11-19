import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables } from 'twenty-ui/theme';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { NavigationMenuTabMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuTabMenuContent';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { MainNavigationDrawerTab } from '@/navigation/components/MainNavigationDrawerTab';
import { useSwitchNavigationDrawerTab } from '@/navigation/hooks/useSwitchNavigationDrawerTab';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { StyledNavigationDrawerUnreadDot } from '@/ui/navigation/navigation-drawer/components/StyledNavigationDrawerUnreadDot';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

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
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const { switchToNavigationMenuTab } = useSwitchNavigationDrawerTab();
  const dropdownId = `navigation-menu-tab-menu-${tab.id}`;

  const handleClick = () => {
    if (isLayoutCustomizationModeEnabled && isActive) {
      return;
    }

    switchToNavigationMenuTab(tab.id);
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
      ariaLabel={isUnread ? t`${tab.name}, unread` : tab.name}
      iconAccessory={isUnread && <StyledUnreadDot aria-hidden="true" />}
    />
  );

  if (!isLayoutCustomizationModeEnabled) {
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
      <Dropdown.Trigger
        render={<StyledAnchor />}
        nativeButton={false}
        disabled={!isActive}
        tabIndex={-1}
      >
        {tabButton}
      </Dropdown.Trigger>
      <DropdownContent
        side="bottom"
        align="start"
        width={GenericDropdownContentWidth.Large}
        aria-label={t`Tab actions`}
      >
        <NavigationMenuTabMenuContent tab={tab} />
      </DropdownContent>
    </DropdownRoot>
  );
};
