import { fireEvent, render } from '@testing-library/react';

import { RegularTableHeader } from '../__stories__/TableHeader.stories';

it('Checks the TableHeader renders', async () => {
  const { getByText, queryByText } = render(<RegularTableHeader />);

  const sortDropdownButton = getByText('Sort');
  fireEvent.click(sortDropdownButton);

  const sortByCreatedAt = getByText('Created at');
  fireEvent.click(sortByCreatedAt);

  expect(getByText('Created at')).toBeDefined();

  const cancelButton = getByText('Cancel');
  fireEvent.click(cancelButton);

  expect(queryByText('Created at')).toBeNull();
});
