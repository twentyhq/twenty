import styled from '@emotion/styled';
import { useMatch, useResolvedPath } from 'react-router-dom';
import NavItem from './NavItem';

const NavbarContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: stretch;
  padding-left: 12px;
  height: 58px;
  border-bottom: 2px solid #eaecee;
`;

function Navbar() {
  return (
    <>
      <NavbarContainer>
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
      </NavbarContainer>
    </>
  );
}

export default Navbar;
