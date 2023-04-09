import { render } from '@testing-library/react';

import { CompaniesDefault } from '../__stories__/Companies.stories';

it('Checks the Companies page render', () => {
  const { getByTestId } = render(<CompaniesDefault />);

  const title = getByTestId('top-bar-title');
  expect(title).toHaveTextContent('Companies');
});
