import { TbBuilding, TbUser } from 'react-icons/tb';
import { useMatch, useResolvedPath } from 'react-router-dom';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';

import { navbarState } from '../states/navbarState';

import NavItem from './NavItem';
import NavTitle from './NavTitle';
import WorkspaceContainer from './WorkspaceContainer';

const NavbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: ${() => (useRecoilValue(navbarState) ? '220px' : '0')};
  padding: ${(props) => props.theme.spacing(2)};
  flex-shrink: 0;
`;

const NavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
`;

export function Navbar() {
  return (
    <>
      <NavbarContainer>
        <WorkspaceContainer />
        <NavItemsContainer>
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
      </NavbarContainer>
    </>
  );
}
