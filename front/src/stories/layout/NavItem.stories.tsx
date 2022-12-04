import { MemoryRouter } from 'react-router-dom';

import NavItem from '../../layout/NavItem';

export default {
  title: 'NavItem',
  component: NavItem,
};

export const NavItemDefault = () => (
  <MemoryRouter>
    <NavItem label="Test" to="/test" />
  </MemoryRouter>
);

export const NavItemActive = () => (
  <MemoryRouter initialEntries={['/test']}>
    <NavItem label="Test" to="/test" active={true} />
  </MemoryRouter>
);
