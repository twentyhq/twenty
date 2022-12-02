import { css } from '@linaria/core';
import { useMatch, useResolvedPath } from 'react-router-dom';
import NavItem from './NavItem';

const navbar = css`
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
      <div className={navbar}>
        <NavItem
          label="Tasks"
          to="/"
          active={
            !!useMatch({
              path: useResolvedPath('/').pathname,
              end: true,
            })
          }
        />
        <NavItem
          label="History"
          to="/history"
          active={
            !!useMatch({
              path: useResolvedPath('/history').pathname,
              end: true,
            })
          }
        />
        <NavItem
          label="Performances"
          to="/performances"
          active={
            !!useMatch({
              path: useResolvedPath('/performances').pathname,
              end: true,
            })
          }
        />
      </div>
    </>
  );
}

export default Navbar;
