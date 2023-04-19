import { render } from '@testing-library/react';

import {
  RegularCompanyChip,
  RegularCompanyChipWithImage,
} from '../__stories__/CompanyChip';

it('Checks the CompanyChip renders', () => {
  const { getByText } = render(<RegularCompanyChip />);

  expect(getByText('selected-company-1')).toBeDefined();
});

it('Checks the CompanyChip img renders', () => {
  const { getByTestId } = render(<RegularCompanyChipWithImage />);

  expect(getByTestId('company-chip-image')).toHaveAttribute('src', 'coucou.fr');
});
