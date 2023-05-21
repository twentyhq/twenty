import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@emotion/react';

import NavItem from '../../../layout/navbar/NavItem';
import { lightTheme } from '../../styles/themes';
import { TbUser } from 'react-icons/tb';

const component = {
  title: 'NavItem',
  component: NavItem,
};

export default component;

export const NavItemDefault = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter>
      <NavItem label="Test" to="/test" icon={<TbUser size={16} />} />
    </MemoryRouter>
  </ThemeProvider>
);

export const NavItemActive = () => (
  <ThemeProvider theme={lightTheme}>
    <MemoryRouter initialEntries={['/test']}>
      <NavItem
        label="Test"
        to="/test"
        active={true}
        icon={<TbUser size={16} />}
      />
    </MemoryRouter>
  </ThemeProvider>
);
