import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconColumnInsertRight, IconPlus } from 'twenty-ui/display';

import { pendingInsertionNavigationMenuItemState } from '@/navigation-menu-item/common/states/pendingInsertionNavigationMenuItemState';
import { selectedNavigationMenuItemIdInEditModeState } from '@/navigation-menu-item/common/states/selectedNavigationMenuItemIdInEditModeState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const WorkspaceSectionAddMenuItemButton = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
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
