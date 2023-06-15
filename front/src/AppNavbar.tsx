import { useMatch, useResolvedPath } from 'react-router-dom';

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
  return (
    <>
      <NavWorkspaceButton />
      <NavItemsContainer>
        <NavItem
          label="Search"
          to="/search"
          icon={<IconSearch size={16} />}
          soon={true}
        />
        <NavItem
          label="Inbox"
          to="/inbox"
          icon={<IconInbox size={16} />}
          soon={true}
        />
        <NavItem
          label="Settings"
          to="/settings/profile"
          icon={<IconSettings size={16} />}
        />
        <NavTitle label="Workspace" />
        <NavItem
          label="People"
          to="/people"
          icon={<IconUser size={16} />}
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
          icon={<IconBuildingSkyscraper size={16} />}
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
