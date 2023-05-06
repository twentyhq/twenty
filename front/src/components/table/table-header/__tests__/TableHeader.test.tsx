import { fireEvent, render, waitFor } from '@testing-library/react';

import { RegularTableHeader } from '../__stories__/TableHeader.stories';

it('Checks the TableHeader renders', async () => {
  const { getByText } = render(<RegularTableHeader />);

  const sortDropdownButton = getByText('Sort');
  fireEvent.click(sortDropdownButton);

  const sortByCreatedAt = getByText('Created at');
  fireEvent.click(sortByCreatedAt);

  expect(getByText('Created at')).toBeDefined();
});
