import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { IconColumnInsertRight, IconPlus } from 'twenty-ui/display';

import { addMenuItemInsertionContextState } from '@/navigation-menu-item/states/addMenuItemInsertionContextState';
import { selectedNavigationMenuItemInEditModeState } from '@/navigation-menu-item/states/selectedNavigationMenuItemInEditModeState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { sidePanelPageState } from '@/side-panel/states/sidePanelPageState';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

export const WorkspaceSectionAddMenuItemButton = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const sidePanelPage = useAtomStateValue(sidePanelPageState);
  const addMenuItemInsertionContext = useAtomStateValue(
    addMenuItemInsertionContextState,
  );
  const setAddMenuItemInsertionContext = useSetAtomState(
    addMenuItemInsertionContextState,
  );

  const setSelectedNavigationMenuItemInEditMode = useSetAtomState(
    selectedNavigationMenuItemInEditModeState,
  );

  const handleClick = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    setAddMenuItemInsertionContext(null);
    setSelectedNavigationMenuItemInEditMode(null);
    navigateSidePanel({
      page: SidePanelPages.NavigationMenuAddItem,
      pageTitle: t`New sidebar item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack: true,
    });
  };

  const isSelected =
    sidePanelPage === SidePanelPages.NavigationMenuAddItem &&
    addMenuItemInsertionContext === null;

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
