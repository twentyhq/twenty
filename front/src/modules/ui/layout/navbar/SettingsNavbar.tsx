import { TbColorSwatch, TbLogout, TbSettings, TbUser } from 'react-icons/tb';
import { useMatch, useResolvedPath } from 'react-router-dom';
import styled from '@emotion/styled';

import NavItem from './NavItem';
import NavTitle from './NavTitle';
import { SettingsBackbuttonContainer } from './SettingsBackButtonContainer';

const NavbarContainer = styled.div`
  display: flex;
  align-items: flex-end;
  flex-direction: column;
  width: 500px;
  padding: 41px 32px 12px 8px;
  flex-shrink: 0;
  overflow: hidden;
`;

const NavbarSubContainer = styled.div`
  display: flex;
  width: 160px;
  flex-direction: column;
`;

const NavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export function SettingsNavbar() {
  return (
    <>
      <NavbarContainer>
        <NavbarSubContainer>
          <SettingsBackbuttonContainer />
          <NavItemsContainer>
            <NavTitle label="User" />
            <NavItem
              label="Profile"
              to="/settings/profile"
              icon={<TbUser size={16} />}
              active={
                !!useMatch({
                  path: useResolvedPath('/people').pathname,
                  end: true,
                })
              }
            />
            <NavItem
              label="Experience"
              to="/settings/profile/experience"
              icon={<TbColorSwatch size={16} />}
              active={
                !!useMatch({
                  path: useResolvedPath('/settings/profile/experience')
                    .pathname,
                  end: true,
                })
              }
            />
            <NavTitle label="Workspace" />
            <NavItem
              label="General"
              to="/settings/workspace"
              icon={<TbSettings size={16} />}
              active={
                !!useMatch({
                  path: useResolvedPath('/settings/workspace').pathname,
                  end: true,
                })
              }
            />
            <NavTitle label="Other" />
            <NavItem
              label="Logout"
              to="/settings/logout"
              icon={<TbLogout size={16} />}
              danger={true}
            />
          </NavItemsContainer>
        </NavbarSubContainer>
      </NavbarContainer>
    </>
  );
}
