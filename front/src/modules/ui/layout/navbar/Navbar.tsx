import { TbBuilding, TbUser } from 'react-icons/tb';
import { useMatch, useResolvedPath } from 'react-router-dom';
import styled from '@emotion/styled';

import { User } from '@/users/interfaces/user.interface';
import { Workspace } from '@/workspaces/interfaces/workspace.interface';

import NavItem from './NavItem';
import NavTitle from './NavTitle';
import WorkspaceContainer from './WorkspaceContainer';

const NavbarContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 220px;
  padding: ${(props) => props.theme.spacing(2)};
  flex-shrink: 0;
`;

const NavItemsContainer = styled.div`
  display: flex;
  flex-direction: column;
  margin-top: 40px;
`;

type OwnProps = {
  user?: User;
  workspace?: Workspace;
};

export function Navbar({ workspace }: OwnProps) {
  return (
    <>
      <NavbarContainer>
        {workspace && <WorkspaceContainer workspace={workspace} />}
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
