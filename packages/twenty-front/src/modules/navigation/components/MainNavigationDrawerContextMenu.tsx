import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type MouseEvent, type ReactNode, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { useIsMobile } from 'twenty-ui/utilities';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { type PositionType } from '@/command-menu-item/types/PositionType';
import { createVirtualElementFromPosition } from '@/command-menu-item/utils/createVirtualElementFromPosition';
import { isLayoutCustomizationModeEnabledState } from '@/layout-customization/states/isLayoutCustomizationModeEnabledState';
import { MainNavigationDrawerContextMenuContent } from '@/navigation/components/MainNavigationDrawerContextMenuContent';
import { useIsSettingsDrawer } from '@/navigation/hooks/useIsSettingsDrawer';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
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
  const isMobile = useIsMobile();
  const isSettingsDrawer = useIsSettingsDrawer();
  const hasLayoutsPermission = useHasPermissionFlag(PermissionFlagType.LAYOUTS);
  const isLayoutCustomizationModeEnabled = useAtomStateValue(
    isLayoutCustomizationModeEnabledState,
  );
  const [position, setPosition] = useState<PositionType>({ x: null, y: null });
  const [targetSectionId, setTargetSectionId] = useState<string | null>(null);
  const { openDropdown } = useOpenDropdown();
  const { closeDropdown } = useCloseDropdown();

  const dropdownId = 'main-navigation-drawer-context-menu';
  const canCustomizeSidebar =
    !isMobile &&
    !isSettingsDrawer &&
    hasLayoutsPermission &&
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
    openDropdown({ dropdownComponentInstanceIdFromProps: dropdownId });
  };

  return (
    <StyledContextMenuArea onContextMenu={handleContextMenu}>
      {children}
      {canCustomizeSidebar && (
        <DropdownRoot dropdownId={dropdownId} type="menu">
          <DropdownContent
            anchor={createVirtualElementFromPosition(position)}
            side="bottom"
            align="start"
            width={GenericDropdownContentWidth.Large}
            aria-label={t`Sidebar actions`}
          >
            <MainNavigationDrawerContextMenuContent
              targetSectionId={targetSectionId}
              onClose={() => closeDropdown(dropdownId)}
            />
          </DropdownContent>
        </DropdownRoot>
      )}
    </StyledContextMenuArea>
  );
};
