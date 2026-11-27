import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { useIcons } from 'twenty-ui/icon/provider';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { type NamedNavigationMenuItem } from '@/navigation-menu-item/common/types/NamedNavigationMenuItem';
import { type InboxChatAttention } from '@/inbox/types/InboxChatAttention';
import { useGetNavigationMenuTabLabel } from '@/navigation-menu-item/display/hooks/useGetNavigationMenuTabLabel';
import { useGetNavigationMenuTabAttentionLabel } from '@/navigation-menu-item/display/hooks/useGetNavigationMenuTabAttentionLabel';
import { NavigationMenuCustomizeSidebarMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuCustomizeSidebarMenuContent';
import { NavigationMenuTabMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuTabMenuContent';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { MainNavigationDrawerTab } from '@/navigation/components/MainNavigationDrawerTab';
import { StyledNavigationDrawerAttentionDot } from '@/navigation/components/StyledNavigationDrawerAttentionDot';
import { useCanCustomizeSidebar } from '@/navigation/hooks/useCanCustomizeSidebar';
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
  isLabelHidden: boolean;
  attention: InboxChatAttention | null;
};

export const MainNavigationDrawerSidebarTab = ({
  tab,
  isActive,
  isExpanded,
  shouldShowTooltip,
  isLabelHidden,
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
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
  const canCustomizeSidebar = useCanCustomizeSidebar();
  const { switchToNavigationMenuTab } = useSwitchNavigationDrawerTab();
  const { openDropdown } = useOpenDropdown();
  const anchorRef = useRef<HTMLSpanElement>(null);
  const dropdownId = `navigation-menu-tab-menu-${tab.id}`;
  const isTabMenuAvailable =
    isLayoutCustomizationModeEnabled || canCustomizeSidebar;

  const openTabMenu = () =>
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });

  const selectTab = () => {
    setSelectedNavigationMenuItemIdInEditMode((selectedId) =>
      selectedId === tab.id ? null : selectedId,
    );
    switchToNavigationMenuTab(tab.id);
  };

  const handleClick = () => {
    if (isActive && isLayoutCustomizationModeEnabled) {
      return;
    }

    selectTab();
  };

  const handleTabMenuOpenChange = (isOpen: boolean) => {
    if (isOpen && isLayoutCustomizationModeEnabled) {
      setSelectedNavigationMenuItemIdInEditMode(tab.id);
    }
  };

  const handleContextMenu = (event: MouseEvent<HTMLSpanElement>) => {
    event.preventDefault();

    if (!isActive) {
      selectTab();
    }

    openTabMenu();
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
      isLabelHidden={isLabelHidden}
      onClick={handleClick}
      isSelectedInEditMode={
        isLayoutCustomizationModeEnabled &&
        isActive &&
        selectedNavigationMenuItemIdInEditMode === tab.id
      }
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

  if (!isTabMenuAvailable) {
    return <StyledAnchor>{tabButton}</StyledAnchor>;
  }

  return (
    <DropdownRoot
      dropdownId={dropdownId}
      type="menu"
      onOpenChange={handleTabMenuOpenChange}
    >
      {navigationMenuItemIdToRename === tab.id && (
        <NavigationMenuItemDropdownOpenEffect
          dropdownId={dropdownId}
          onOpen={() => setNavigationMenuItemIdToRename(null)}
        />
      )}
      <StyledAnchor ref={anchorRef} onContextMenu={handleContextMenu}>
        {isActive && isLayoutCustomizationModeEnabled ? (
          <Dropdown.Trigger render={tabButton} />
        ) : (
          tabButton
        )}
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
          <NavigationMenuCustomizeSidebarMenuContent />
        )}
      </DropdownContent>
    </DropdownRoot>
  );
};
