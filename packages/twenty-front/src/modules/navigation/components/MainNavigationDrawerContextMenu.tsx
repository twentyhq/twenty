import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPaint } from 'twenty-ui/icon';

import { type PositionType } from '@/command-menu-item/types/PositionType';
import { createVirtualElementFromPosition } from '@/command-menu-item/utils/createVirtualElementFromPosition';
import { useEnterLayoutCustomizationMode } from '@/layout-customization/hooks/useEnterLayoutCustomizationMode';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { NavigationMenuItemSelectableItem } from '@/navigation-menu-item/edit/components/NavigationMenuItemSelectableItem';
import { MAIN_NAVIGATION_DRAWER_CONTEXT_MENU_DROPDOWN_ID } from '@/navigation/constants/MainNavigationDrawerContextMenuDropdownId';
import { useCanCustomizeSidebar } from '@/navigation/hooks/useCanCustomizeSidebar';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const StyledContextMenuArea = styled.div`
  display: contents;
`;

type MainNavigationDrawerContextMenuProps = {
  children: ReactNode;
};

export const MainNavigationDrawerContextMenu = ({
  children,
}: MainNavigationDrawerContextMenuProps) => {
  const { t } = useLingui();
  const isSettingsDrawer = useIsSettingsDrawer();
  const canCustomizeSidebar = useCanCustomizeSidebar();
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [position, setPosition] = useState<PositionType>({ x: null, y: null });
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();
  const { enterLayoutCustomizationMode } = useEnterLayoutCustomizationMode();

  const canOpenContextMenu =
    canCustomizeSidebar &&
    !isSettingsDrawer &&
    !isLayoutCustomizationModeEnabled;

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target : null;

    if (
      !canOpenContextMenu ||
      event.defaultPrevented ||
      isDefined(target?.closest('a'))
    ) {
      return;
    }

    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    openDropdown({
      dropdownComponentInstanceIdFromProps:
        MAIN_NAVIGATION_DRAWER_CONTEXT_MENU_DROPDOWN_ID,
    });
  };

  const handleCustomizeSidebarClick = () => {
    closeDropdown(MAIN_NAVIGATION_DRAWER_CONTEXT_MENU_DROPDOWN_ID);
    enterLayoutCustomizationMode();
  };

  return (
    <StyledContextMenuArea onContextMenu={handleContextMenu}>
      {children}
      {canOpenContextMenu && (
        <DropdownRoot
          dropdownId={MAIN_NAVIGATION_DRAWER_CONTEXT_MENU_DROPDOWN_ID}
          type="menu"
        >
          <DropdownContent
            anchor={createVirtualElementFromPosition(position)}
            side="bottom"
            align="start"
            width={GenericDropdownContentWidth.Large}
            aria-label={t`Sidebar actions`}
          >
            <Dropdown.Section>
              <NavigationMenuItemSelectableItem
                item={{
                  id: 'customize-sidebar',
                  label: t`Customize sidebar`,
                  Icon: IconPaint,
                  onClick: handleCustomizeSidebarClick,
                }}
              />
            </Dropdown.Section>
          </DropdownContent>
        </DropdownRoot>
      )}
    </StyledContextMenuArea>
  );
};
