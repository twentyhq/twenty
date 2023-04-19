import { fireEvent, render } from '@testing-library/react';

import { RegularSortOrFilterChip } from '../__stories__/SortOrFilterChip.stories';

const removeFunction = jest.fn();

it('Checks the RegularSortOrFilterChip renders', async () => {
  const { getByText, getByTestId } = render(
    <RegularSortOrFilterChip removeFunction={removeFunction} />,
  );
  expect(getByText('Test sort')).toBeDefined();

  const removeIcon = getByTestId('remove-icon-test_sort');
  fireEvent.click(removeIcon);

  expect(removeFunction).toHaveBeenCalled();
});
