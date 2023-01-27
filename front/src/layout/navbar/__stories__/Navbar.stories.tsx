import { MemoryRouter } from 'react-router-dom';

import Navbar from '../Navbar';

export default {
  title: 'Navbar',
  component: Navbar,
};

export const NavbarOnInsights = () => (
  <MemoryRouter initialEntries={['/insights']}>
    <Navbar
      user={{
        email: 'charles@twenty.com',
        first_name: 'Charles',
        last_name: 'Bochet',
        tenant: { id: '1', name: 'Twenty' },
      }}
    />
  </MemoryRouter>
);
