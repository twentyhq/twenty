import { MemoryRouter } from 'react-router-dom';

import Navbar from '../../src/layout/Navbar';

export default {
  title: 'Navbar',
  component: Navbar,
};

export const NavbarOnPerformance = () => (
  <MemoryRouter initialEntries={['/performances']}>
    <Navbar />
  </MemoryRouter>
);
