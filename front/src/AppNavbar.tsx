import {
  TbBuilding,
  TbInbox,
  TbSearch,
  TbSettings,
  TbUser,
} from 'react-icons/tb';
import { useMatch, useResolvedPath } from 'react-router-dom';

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
          icon={<TbSearch size={16} />}
          soon={true}
        />
        <NavItem
          label="Inbox"
          to="/inbox"
          icon={<TbInbox size={16} />}
          soon={true}
        />
        <NavItem
          label="Settings"
          to="/settings/profile"
          icon={<TbSettings size={16} />}
        />
        <NavTitle label="Workspace" />
        <NavItem
          label="People"
          to="/people"
          icon={<TbUser size={16} />}
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
          icon={<TbBuilding size={16} />}
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
