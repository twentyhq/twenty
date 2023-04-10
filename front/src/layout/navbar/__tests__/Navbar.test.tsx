import { render } from '@testing-library/react';

import { NavbarOnCompanies } from '../__stories__/Navbar.stories';

it('Checks the NavItem renders', () => {
  const { getByRole } = render(<NavbarOnCompanies />);

  expect(getByRole('button', { name: 'Companies' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  expect(getByRole('button', { name: 'People' })).toHaveAttribute(
    'aria-selected',
    'false',
  );
});
