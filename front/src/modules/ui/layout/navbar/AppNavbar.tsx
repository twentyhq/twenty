import { TbBuilding, TbSettings, TbUser } from 'react-icons/tb';
import { useMatch, useResolvedPath } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { isNavbarOpenedState } from '../states/isNavbarOpenedState';
import { MOBILE_VIEWPORT } from '../styles/themes';

import NavItem from './NavItem';
import NavTitle from './NavTitle';
import WorkspaceContainer from './WorkspaceContainer';

const NavbarContent = styled.div`
  display: ${() => (useRecoilValue(isNavbarOpenedState) ? 'block' : 'none')};
`;

const NavbarContainer = styled.div`
  flex-direction: column;
  width: ${() => (useRecoilValue(isNavbarOpenedState) ? '220px' : '0')};
  padding: ${(props) => props.theme.spacing(2)};
  flex-shrink: 0;
  overflow: hidden;

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    width: ${(props) =>
      useRecoilValue(isNavbarOpenedState)
        ? `calc(100% - ` + props.theme.spacing(4) + `)`
        : '0'};
`;

const NavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
`;

export function AppNavbar() {
  return (
    <>
      <NavbarContainer>
        <NavbarContent>
          <WorkspaceContainer />
          <NavItemsContainer>
            <NavItem
              label="Settings"
              to="/settings"
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
        </NavbarContent>
      </NavbarContainer>
    </>
  );
}
