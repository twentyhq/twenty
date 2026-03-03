import { useLingui } from '@lingui/react/macro';
import React from 'react';
import { IconColumnInsertRight, IconPlus } from 'twenty-ui/display';
import { CommandMenuPages } from 'twenty-shared/types';

import { useNavigateCommandMenu } from '@/command-menu/hooks/useNavigateCommandMenu';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

export const WorkspaceSectionAddMenuItemButton = () => {
  const { t } = useLingui();
  const { navigateCommandMenu } = useNavigateCommandMenu();

  const handleClick = (event?: React.MouseEvent) => {
    event?.stopPropagation();
    navigateCommandMenu({
      page: CommandMenuPages.NavigationMenuAddItem,
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
    />
  );
};
