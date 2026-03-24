import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconColumnInsertRight, IconPlus } from 'twenty-ui/display';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemInEditModeState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const WorkspaceSectionAddMenuItemButton = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const pendingInsertionNavigationMenuItem = useAtomStateValue(
    pendingInsertionNavigationMenuItemState,
  );
  const setPendingInsertionNavigationMenuItem = useSetAtomState(
    pendingInsertionNavigationMenuItemState,
  );

  const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
    selectedNavigationMenuItemInEditModeState,
  );

  const handleClick = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setPendingInsertionNavigationMenuItem(null);
    setSelectedNavigationMenuItemInEditMode(null);
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
    <NavigationDrawerItem
      Icon={IconPlus}
      label={t`Add menu item`}
      onClick={handleClick}
      triggerEvent="CLICK"
      variant="tertiary"
      isSelectedInEditMode={isSelected}
    />
  );
};
