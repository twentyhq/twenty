import { useLingui } from '@lingui/react/macro';
import { useRef } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon';
import {
  type NavigationMenuItem,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NAVIGATION_MENU_TAB_ICON_DEFAULT } from '@/navigation-menu-item/common/constants/NavigationMenuTabIconDefault';
import { navigationMenuItemIdToRenameState } from '@/navigation-menu-item/common/states/navigationMenuItemIdToRenameState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { NavigationMenuTabCustomizeMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuTabCustomizeMenuContent';
import { NavigationMenuTabMenuContent } from '@/navigation-menu-item/edit/components/NavigationMenuTabMenuContent';
import { NavigationMenuItemDropdownOpenEffect } from '@/navigation-menu-item/edit/effect-components/NavigationMenuItemDropdownOpenEffect';
import { MainNavigationDrawerModeButton } from '@/navigation/components/MainNavigationDrawerModeButton';
import { useSwitchNavigationDrawerMode } from '@/navigation/hooks/useSwitchNavigationDrawerMode';
import { type NavigationDrawerAttention } from '@/navigation/types/NavigationDrawerAttention';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type MainNavigationDrawerCustomTabProps = {
  tab: NavigationMenuItem;
  isActive: boolean;
  isExpanded: boolean;
  isTooltipDisabled: boolean;
  attention?: NavigationDrawerAttention | null;
};

export const MainNavigationDrawerCustomTab = ({
  tab,
  isActive,
  isExpanded,
  isTooltipDisabled,
  attention,
}: MainNavigationDrawerCustomTabProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [navigationMenuItemIdToRename, setNavigationMenuItemIdToRename] =
    useAtomState(navigationMenuItemIdToRenameState);
  const [
    selectedNavigationMenuItemIdInEditMode,
    setSelectedNavigationMenuItemIdInEditMode,
  ] = useAtomState(selectedNavigationMenuItemIdInEditModeState);
  const { switchToNavigationMenuTab } = useSwitchNavigationDrawerMode();
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);

  const label = tab.name ?? t`Tab`;
  const dropdownId = `navigation-menu-tab-menu-${tab.id}`;
  const openTabMenu = () =>
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });

  const selectTab = () => switchToNavigationMenuTab(tab.id);
  const focusTabInEditMode = () => {
    if (isLayoutCustomizationModeEnabled) {
      setSelectedNavigationMenuItemIdInEditMode(tab.id);
    }
  };

  return (
    <>
      <MainNavigationDrawerModeButton
        Icon={getIcon(tab.icon ?? NAVIGATION_MENU_TAB_ICON_DEFAULT)}
        label={label}
        ariaLabel={
          isDefined(attention) ? t`${label}, needs your attention` : label
        }
        tooltip={label}
        isTooltipDisabled={isTooltipDisabled}
        isActive={isActive}
        isExpanded={isExpanded}
        attention={attention}
        isSelectedInEditMode={
          isLayoutCustomizationModeEnabled &&
          isActive &&
          selectedNavigationMenuItemIdInEditMode === tab.id
        }
        buttonRef={buttonRef}
        onClick={() => {
          if (isActive && hasLayoutsPermission) {
            focusTabInEditMode();
            openTabMenu();
            return;
          }

          setSelectedNavigationMenuItemIdInEditMode((selectedId) =>
            selectedId === tab.id ? null : selectedId,
          );
          selectTab();
        }}
        onContextMenu={
          hasLayoutsPermission
            ? (event) => {
                event.preventDefault();
                if (isLayoutCustomizationModeEnabled) {
                  selectTab();
                  focusTabInEditMode();
                }
                openTabMenu();
              }
            : undefined
        }
      />
      {hasLayoutsPermission && (
        <DropdownRoot dropdownId={dropdownId} type="menu">
          {navigationMenuItemIdToRename === tab.id && (
            <NavigationMenuItemDropdownOpenEffect
              dropdownId={dropdownId}
              onOpen={() => {
                setNavigationMenuItemIdToRename(null);
                focusTabInEditMode();
              }}
            />
          )}
          <DropdownContent
            anchor={buttonRef}
            side="bottom"
            align="start"
            width={GenericDropdownContentWidth.Large}
            aria-label={t`Tab actions`}
          >
            {isLayoutCustomizationModeEnabled ? (
              <NavigationMenuTabMenuContent
                tab={tab}
                onClose={() => closeDropdown(dropdownId)}
              />
            ) : (
              <NavigationMenuTabCustomizeMenuContent
                onClose={() => closeDropdown(dropdownId)}
              />
            )}
          </DropdownContent>
        </DropdownRoot>
      )}
    </>
  );
};
