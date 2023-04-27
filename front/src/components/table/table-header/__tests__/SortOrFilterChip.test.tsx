import { fireEvent, render } from '@testing-library/react';

import {
  RegularFilterChip,
  RegularSortChip,
} from '../__stories__/SortOrFilterChip.stories';

const removeFunction = jest.fn();

it('Checks the filter chip renders', async () => {
  const { getByText, getByTestId } = render(
    <RegularFilterChip removeFunction={removeFunction} />,
  );
  expect(getByText('Account owner:')).toBeDefined();

  const removeIcon = getByTestId('remove-icon-test_sort');
  fireEvent.click(removeIcon);

  expect(removeFunction).toHaveBeenCalled();
});

it('Checks the sort chip renders', async () => {
  const { getByText, getByTestId } = render(
    <RegularSortChip removeFunction={removeFunction} />,
  );
  expect(getByText('Created at')).toBeDefined();

  const removeIcon = getByTestId('remove-icon-test_sort');
  fireEvent.click(removeIcon);

  expect(removeFunction).toHaveBeenCalled();
});
