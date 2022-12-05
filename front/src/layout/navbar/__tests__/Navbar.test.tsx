import { render } from '@testing-library/react';

import { NavbarOnInsights } from '../__stories__/Navbar.stories';

it('Checks the NavItem renders', () => {
  const { getByRole } = render(<NavbarOnInsights />);

  expect(getByRole('button', { name: 'Insights' })).toHaveAttribute(
    'aria-selected',
    'true',
  );

  expect(getByRole('button', { name: 'Inbox' })).toHaveAttribute(
    'aria-selected',
    'false',
  );
});
