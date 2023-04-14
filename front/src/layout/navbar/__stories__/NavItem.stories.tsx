import { MemoryRouter } from 'react-router-dom';
import { faUser } from '@fortawesome/pro-regular-svg-icons';
import { ThemeProvider } from '@emotion/react';

import NavItem from '../../../layout/navbar/NavItem';
import { lightTheme } from '../../styles/themes';

export default {
  title: 'NavItem',
  component: NavItem,
};

export const NavItemDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <NavItem label="Test" to="/test" icon={faUser} />
    </MemoryRouter>
  </ThemeProvider>
);

export const NavItemActive = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter initialEntries={['/test']}>
      <NavItem label="Test" to="/test" active={true} icon={faUser} />
    </MemoryRouter>
  </ThemeProvider>
);
