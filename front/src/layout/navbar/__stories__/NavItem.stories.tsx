import { MemoryRouter } from 'react-router-dom';
import { FaRegUser } from 'react-icons/fa';
import { ThemeProvider } from '@emotion/react';

import NavItem from '../../../layout/navbar/NavItem';
import { lightTheme } from '../../styles/themes';

const component = {
  title: 'NavItem',
  component: NavItem,
};

export default component;

export const NavItemDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <NavItem label="Test" to="/test" icon={<FaRegUser />} />
    </MemoryRouter>
  </ThemeProvider>
);

export const NavItemActive = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter initialEntries={['/test']}>
      <NavItem label="Test" to="/test" active={true} icon={<FaRegUser />} />
    </MemoryRouter>
  </ThemeProvider>
);
