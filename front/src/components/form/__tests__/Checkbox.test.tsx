import { render } from '@testing-library/react';

import { RegularCheckbox } from '../__stories__/Checkbox.stories';

it('Checks the NavItem renders', () => {
  const { getByTestId } = render(<RegularCheckbox />);

  expect(getByTestId('input-checkbox')).toHaveAttribute(
    'name',
    'selected-company-1',
  );
});
