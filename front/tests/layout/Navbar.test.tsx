import { render, fireEvent } from '@testing-library/react';

import { NavbarOnPerformance } from '../../stories/layout/Navbar.stories';

it('Checks the NavItem renders', () => {
  const { getByRole } = render(<NavbarOnPerformance />);

  expect(getByRole('button', { name: 'Performances' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  expect(getByRole('button', { name: 'Tasks' })).toHaveAttribute(
    'aria-selected',
    'false',
  );
});
