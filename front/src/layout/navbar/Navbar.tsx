import styled from '@emotion/styled';
import { useMatch, useResolvedPath } from 'react-router-dom';
import { User } from '../../interfaces/user.interface';
import NavItem from './NavItem';
import ProfileContainer from './ProfileContainer';

const NavbarContainer = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  padding-left: 12px;
  height: 58px;
  border-bottom: 2px solid #eaecee;
`;

const NavItemsContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

type OwnProps = {
  user?: User;
};

function Navbar({ user }: OwnProps) {
  return (
    <>
      <NavbarContainer>
        <NavItemsContainer>
          <NavItem
            label="Inbox"
            to="/"
            active={
              !!useMatch({
                path: useResolvedPath('/').pathname,
                end: true,
              })
            }
          />
          <NavItem
            label="Contacts"
            to="/contacts"
            active={
              !!useMatch({
                path: useResolvedPath('/contacts').pathname,
                end: true,
              })
            }
          />
          <NavItem
            label="Insights"
            to="/insights"
            active={
              !!useMatch({
                path: useResolvedPath('/insights').pathname,
                end: true,
              })
            }
          />
        </NavItemsContainer>
        <ProfileContainer user={user} />
      </NavbarContainer>
    </>
  );
}

export default Navbar;
