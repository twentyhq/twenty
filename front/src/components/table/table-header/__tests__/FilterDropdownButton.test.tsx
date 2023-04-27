import { fireEvent, render, waitFor } from '@testing-library/react';
import { RegularFilterDropdownButton } from '../__stories__/FilterDropdownButton.stories';
import { FaUsers } from 'react-icons/fa';

it('Checks the default top option is Include', async () => {
  const setFilters = jest.fn();
  const { getByText } = render(
    <RegularFilterDropdownButton setFilter={setFilters} />,
  );

  const sortDropdownButton = getByText('Filter');
  fireEvent.click(sortDropdownButton);

  const filterByPeople = getByText('People');
  fireEvent.click(filterByPeople);

  const filterByJohn = getByText('John Doe');
  fireEvent.click(filterByJohn);

  expect(setFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'John Doe',
      value: 'John Doe',
      label: 'People',
      icon: <FaUsers />,
    }),
  );
});

it('Checks the selection of top option for Doesnot include', async () => {
  const setFilters = jest.fn();
  const { getByText } = render(
    <RegularFilterDropdownButton setFilter={setFilters} />,
  );

  const sortDropdownButton = getByText('Filter');
  fireEvent.click(sortDropdownButton);

  const filterByPeople = getByText('People');
  fireEvent.click(filterByPeople);

  const openOperandOptions = getByText('Include');
  fireEvent.click(openOperandOptions);

  const selectOperand = getByText("Doesn't include");
  fireEvent.click(selectOperand);

  const filterByJohn = getByText('John Doe');
  fireEvent.click(filterByJohn);

  expect(setFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'John Doe',
      value: 'John Doe',
      label: 'People',
      icon: <FaUsers />,
    }),
  );
  const blueSortDropdownButton = getByText('Filter');
  await waitFor(() => {
    expect(blueSortDropdownButton).toHaveAttribute('aria-selected', 'true');
  });
});
