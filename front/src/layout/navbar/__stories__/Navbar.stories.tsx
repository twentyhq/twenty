import { MemoryRouter } from 'react-router-dom';

import Navbar from '../Navbar';

export default {
  title: 'Navbar',
  component: Navbar,
};

export const NavbarOnInsights = () => (
  <MemoryRouter initialEntries={['/insights']}>
    <Navbar />
  </MemoryRouter>
);
