import { useMatch, useResolvedPath } from 'react-router-dom';
import { useTheme } from '@emotion/react';

import {
  IconBuildingSkyscraper,
  IconInbox,
  IconSearch,
  IconSettings,
  IconUser,
} from '@/ui/icons/index';
import NavItemsContainer from '@/ui/layout/navbar/NavItemsContainer';

import NavItem from './modules/ui/layout/navbar/NavItem';
import NavTitle from './modules/ui/layout/navbar/NavTitle';
import NavWorkspaceButton from './modules/ui/layout/navbar/NavWorkspaceButton';

export function AppNavbar() {
  const theme = useTheme();
  return (
    <>
      <NavWorkspaceButton />
      <NavItemsContainer>
        <NavItem
          label="Search"
          to="/search"
          icon={<IconSearch size={theme.iconSizeMedium} />}
          soon={true}
        />
        <NavItem
          label="Inbox"
          to="/inbox"
          icon={<IconInbox size={theme.iconSizeMedium} />}
          soon={true}
        />
        <NavItem
          label="Settings"
          to="/settings/profile"
          icon={<IconSettings size={theme.iconSizeMedium} />}
        />
        <NavTitle label="Workspace" />
        <NavItem
          label="People"
          to="/people"
          icon={<IconUser size={theme.iconSizeMedium} />}
          active={
            !!useMatch({
              path: useResolvedPath('/people').pathname,
              end: true,
            })
          }
        />
        <NavItem
          label="Companies"
          to="/companies"
          icon={<IconBuildingSkyscraper size={theme.iconSizeMedium} />}
          active={
            !!useMatch({
              path: useResolvedPath('/companies').pathname,
              end: true,
            })
          }
        />
      </NavItemsContainer>
    </>
  );
}
