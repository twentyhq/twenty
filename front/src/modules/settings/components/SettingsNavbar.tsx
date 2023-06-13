import { TbColorSwatch, TbLogout, TbSettings, TbUser } from 'react-icons/tb';
import { useMatch, useResolvedPath } from 'react-router-dom';
import styled from '@emotion/styled';

import NavBackButton from '@/ui/layout/navbar//NavBackButton';
import NavItem from '@/ui/layout/navbar/NavItem';
import NavItemsContainer from '@/ui/layout/navbar/NavItemsContainer';
import NavTitle from '@/ui/layout/navbar/NavTitle';
import { MOBILE_VIEWPORT } from '@/ui/layout/styles/themes';

const NavbarSubContainer = styled.div`
  display: flex;
  width: 160px;
  flex-direction: column;
  margin-top: 41px;
  margin-left: auto;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: 100%;
  }
`;

export function SettingsNavbar() {
  return (
    <NavbarSubContainer>
      <NavBackButton title="Settings" />
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
          soon={true}
          active={
            !!useMatch({
              path: useResolvedPath('/settings/profile/experience').pathname,
              end: true,
            })
          }
        />
        <NavTitle label="Workspace" />
        <NavItem
          label="General"
          to="/settings/workspace"
          icon={<TbSettings size={16} />}
          soon={true}
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
          to="/logout"
          icon={<TbLogout size={16} />}
          danger={true}
        />
      </NavItemsContainer>
    </NavbarSubContainer>
  );
}
