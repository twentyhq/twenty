import { render, waitFor } from '@testing-library/react';

import { CompaniesDefault } from '../__stories__/Companies.stories';

it('Checks the Companies page render', async () => {
  const { getByTestId } = render(<CompaniesDefault />);

  const title = getByTestId('top-bar-title');
  expect(title).toHaveTextContent('Companies');

  await waitFor(() => {
    const row = getByTestId('row-id-0');
    expect(row).toBeDefined();
  });
});
