import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { IconColumnInsertRight, IconPlus } from 'twenty-ui/display';
import { SidePanelPages } from 'twenty-shared/types';

import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

export const WorkspaceSectionAddMenuItemButton = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();

  const handleClick = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    navigateSidePanel({
      page: SidePanelPages.NavigationMenuAddItem,
      pageTitle: t`New sidebar item`,
      pageIcon: IconColumnInsertRight,
      resetNavigationStack: true,
    });
  };

  return (
    <NavigationDrawerItem
      Icon={IconPlus}
      label={t`Add menu item`}
      onClick={handleClick}
      triggerEvent="CLICK"
      variant="tertiary"
    />
  );
};
