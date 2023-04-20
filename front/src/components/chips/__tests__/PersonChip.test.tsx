import { render } from '@testing-library/react';

import {
  RegularPersonChip,
  RegularPersonChipWithImage,
} from '../__stories__/PersonChip.stories';

it('Checks the PersonChip renders', () => {
  const { getByText, getByTestId } = render(<RegularPersonChip />);

  expect(getByText('selected-company-1')).toBeDefined();
  expect(getByTestId('person-chip-image')).toHaveAttribute(
    'src',
    'person-placeholder.png',
  );
});

it('Checks the PersonChip img renders', () => {
  const { getByTestId } = render(<RegularPersonChipWithImage />);

  expect(getByTestId('person-chip-image')).toHaveAttribute('src', 'coucou.fr');
});
