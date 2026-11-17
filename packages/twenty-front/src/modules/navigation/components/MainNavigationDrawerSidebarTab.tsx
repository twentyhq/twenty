import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, useRef } from 'react';
import { useIcons } from 'twenty-ui/icon/provider';

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
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledAnchor = styled.span`
  display: flex;
  min-width: 0;
`;

type MainNavigationDrawerSidebarTabProps = {
  tab: Pick<NamedNavigationMenuItem, 'id' | 'name' | 'icon'>;
  isActive: boolean;
  isExpanded: boolean;
  shouldShowTooltip: boolean;
  iconAccessory?: ReactNode;
};

export const MainNavigationDrawerSidebarTab = ({
  tab,
  isActive,
  isExpanded,
  shouldShowTooltip,
  iconAccessory,
}: MainNavigationDrawerSidebarTabProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const { switchToNavigationMenuTab } = useSwitchNavigationDrawerTab();
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const dropdownId = `navigation-menu-tab-menu-${tab.id}`;

  const handleClick = () => {
    if (isLayoutCustomizationModeEnabled && isActive) {
      openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
      return;
    }

    switchToNavigationMenuTab(tab.id);
  };

  return (
    <StyledAnchor ref={anchorRef}>
      <MainNavigationDrawerTab
        Icon={getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT)}
        label={tab.name}
        isActive={isActive}
        isExpanded={isExpanded}
        isDisabled={false}
        tooltip={tab.name}
        shouldShowTooltip={shouldShowTooltip}
        onClick={handleClick}
        iconAccessory={iconAccessory}
      />
      {isLayoutCustomizationModeEnabled && (
        <DropdownRoot dropdownId={dropdownId} type="menu">
          {navigationMenuItemIdToRename === tab.id && (
            <NavigationMenuItemDropdownOpenEffect
              dropdownId={dropdownId}
              onOpen={() => setNavigationMenuItemIdToRename(null)}
            />
          )}
          <DropdownContent
            anchor={anchorRef}
            side="bottom"
            align="start"
            width={GenericDropdownContentWidth.Large}
            aria-label={t`Tab actions`}
          >
            <NavigationMenuTabMenuContent
              tab={tab}
              onClose={() => closeDropdown(dropdownId)}
            />
          </DropdownContent>
        </DropdownRoot>
      )}
    </StyledAnchor>
  );
};
