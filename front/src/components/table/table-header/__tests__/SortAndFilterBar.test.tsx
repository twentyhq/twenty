import { fireEvent, render } from '@testing-library/react';

import { RegularSortAndFilterBar } from '../__stories__/SortAndFilterBar.stories';

const removeFunction = jest.fn();

it('Checks the SortAndFilterBar renders', async () => {
  const { getByText, getByTestId } = render(
    <RegularSortAndFilterBar removeFunction={removeFunction} />,
  );
  expect(getByText('Test sort')).toBeDefined();

  const removeIcon = getByTestId('remove-icon-test_sort');
  fireEvent.click(removeIcon);

  expect(removeFunction).toHaveBeenCalled();
});
