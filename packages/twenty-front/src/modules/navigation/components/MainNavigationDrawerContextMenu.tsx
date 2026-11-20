import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';

import { type PositionType } from '@/command-menu-item/types/PositionType';
import { createVirtualElementFromPosition } from '@/command-menu-item/utils/createVirtualElementFromPosition';
import { useIsLayoutCustomizationAllowedOnCurrentPage } from '@/layout-customization/hooks/useIsLayoutCustomizationAllowedOnCurrentPage';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { MainNavigationDrawerContextMenuContent } from '@/navigation/components/MainNavigationDrawerContextMenuContent';
import { MAIN_NAVIGATION_DRAWER_CONTEXT_MENU_DROPDOWN_ID } from '@/navigation/constants/MainNavigationDrawerContextMenuDropdownId';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';

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
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const isLayoutCustomizationAllowedOnCurrentPage =
    useIsLayoutCustomizationAllowedOnCurrentPage();
  const [position, setPosition] = useState<PositionType>({ x: null, y: null });
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const canCustomizeSidebar =
    isCustomizableSidebarEnabled &&
    !isMobile &&
    !isSettingsDrawer &&
    hasLayoutsPermission &&
    isLayoutCustomizationAllowedOnCurrentPage &&
    !isLayoutCustomizationModeEnabled;

  const handleContextMenu = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target instanceof Element ? event.target : null;

    if (
      !canCustomizeSidebar ||
      event.defaultPrevented ||
      isDefined(target?.closest('a'))
    ) {
      return;
    }

    event.preventDefault();
    setPosition({ x: event.clientX, y: event.clientY });
    setTargetSectionId(
      target
        ?.closest('[data-navigation-menu-section-id]')
        ?.getAttribute('data-navigation-menu-section-id') ?? null,
    );
    openDropdown({
      dropdownComponentInstanceIdFromProps:
        MAIN_NAVIGATION_DRAWER_CONTEXT_MENU_DROPDOWN_ID,
    });
  };

  return (
    <StyledContextMenuArea onContextMenu={handleContextMenu}>
      {children}
      {canCustomizeSidebar && (
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
            <MainNavigationDrawerContextMenuContent
              targetSectionId={targetSectionId}
              onClose={() =>
                closeDropdown(MAIN_NAVIGATION_DRAWER_CONTEXT_MENU_DROPDOWN_ID)
              }
            />
          </DropdownContent>
        </DropdownRoot>
      )}
    </StyledContextMenuArea>
  );
};
