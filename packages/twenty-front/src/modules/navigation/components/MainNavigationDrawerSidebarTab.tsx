import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent } from 'react';
import { Dropdown } from 'twenty-ui/components/navigation';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { type InboxChatAttention } from '@/inbox/types/InboxChatAttention';
import { useGetNavigationMenuTabLabel } from '@/navigation-menu-item/display/hooks/useGetNavigationMenuTabLabel';
import { useGetNavigationMenuTabAttentionLabel } from '@/navigation-menu-item/display/hooks/useGetNavigationMenuTabAttentionLabel';
import { NavigationMenuTabMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuTabMenuContent';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { MainNavigationDrawerTab } from '@/navigation/components/MainNavigationDrawerTab';
import { StyledNavigationDrawerAttentionDot } from '@/navigation/components/StyledNavigationDrawerAttentionDot';
import { useSwitchNavigationDrawerTab } from '@/navigation/hooks/useSwitchNavigationDrawerTab';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
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
  attention: InboxChatAttention | null;
};

export const MainNavigationDrawerSidebarTab = ({
  tab,
  isActive,
  isExpanded,
  shouldShowTooltip,
  attention,
}: MainNavigationDrawerSidebarTabProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const getNavigationMenuTabAttentionLabel =
    useGetNavigationMenuTabAttentionLabel();
  const getNavigationMenuTabLabel = useGetNavigationMenuTabLabel();
  const tabLabel = getNavigationMenuTabLabel(tab);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const { switchToNavigationMenuTab } = useSwitchNavigationDrawerTab();
  const { openDropdown } = useOpenDropdown();
  const dropdownId = `navigation-menu-tab-menu-${tab.id}`;

  const handleClick = () => {
    if (isLayoutCustomizationModeEnabled && isActive) {
      return;
    }

    switchToNavigationMenuTab(tab.id);
  };

  const handleContextMenu = (event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();
    handleClick();
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };

  const tabButton = (
    <MainNavigationDrawerTab
      Icon={getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT)}
      label={tabLabel}
      isActive={isActive}
      isExpanded={isExpanded}
      isDisabled={false}
      tooltip={tabLabel}
      shouldShowTooltip={shouldShowTooltip}
      onClick={handleClick}
      ariaLabel={getNavigationMenuTabAttentionLabel({
        tabName: tabLabel,
        attention,
      })}
      iconAccessory={
        isDefined(attention) && (
          <StyledNavigationDrawerAttentionDot
            data-attention={attention}
            aria-hidden="true"
          />
        )
      }
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
        render={<StyledAnchor onContextMenu={handleContextMenu} />}
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
