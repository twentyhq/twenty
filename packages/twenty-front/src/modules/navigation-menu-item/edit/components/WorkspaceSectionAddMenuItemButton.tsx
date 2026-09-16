import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import React from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconColumnInsertRight, IconPlus } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelPageInfoSelector } from '@/side-panel/states/sidePanelPageInfoSelector';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const StyledContainer = styled.div`
  padding-top: ${themeCssVariables.spacing['0.5']};
`;

export const WorkspaceSectionAddMenuItemButton = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const sidePanelPage = useAtomStateValue(sidePanelPageInfoSelector).page;
  const [
    pendingInsertionNavigationMenuItem,
    setPendingInsertionNavigationMenuItem,
  ] = useAtomState(pendingInsertionNavigationMenuItemState);

  const setSelectedNavigationMenuItemIdInEditMode = useSetAtomState(
    selectedNavigationMenuItemIdInEditModeState,
  );

  const handleClick = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setPendingInsertionNavigationMenuItem(null);
    setSelectedNavigationMenuItemIdInEditMode(null);
    navigateSidePanel({
      page: SidePanelPages.NavigationMenuAddItem,
      pageTitle: t`New menu item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack: true,
    });
  };

  const isSelected =
    sidePanelPage === SidePanelPages.NavigationMenuAddItem &&
    pendingInsertionNavigationMenuItem === null;

  return (
    <NavigationMenuItemEntrance>
      <StyledContainer>
        <NavigationDrawerItem
          Icon={IconPlus}
          label={t`Add menu item`}
          onClick={handleClick}
          triggerEvent="CLICK"
          variant="tertiary"
          isSelectedInEditMode={isSelected}
        />
      </StyledContainer>
    </NavigationMenuItemEntrance>
  );
};
