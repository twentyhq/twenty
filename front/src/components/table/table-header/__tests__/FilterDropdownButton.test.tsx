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

  await waitFor(() => {
    const firstSearchResult = getByText('Alexandre Prot');
    expect(firstSearchResult).toBeDefined();
  });

  const filterByJohn = getByText('Alexandre Prot');
  fireEvent.click(filterByJohn);

  expect(setFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'Alexandre Prot',
      value: 'Alexandre Prot',
      label: 'People',
      operand: {
        id: 'include',
        keyWord: 'ilike',
        label: 'Include',
      },
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

  await waitFor(() => {
    const firstSearchResult = getByText('Alexandre Prot');
    expect(firstSearchResult).toBeDefined();
  });

  const filterByJohn = getByText('Alexandre Prot');
  fireEvent.click(filterByJohn);

  expect(setFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'Alexandre Prot',
      value: 'Alexandre Prot',
      label: 'People',
      operand: {
        id: 'not-include',
        keyWord: 'not_ilike',
        label: "Doesn't include",
      },
      icon: <FaUsers />,
    }),
  );
  const blueSortDropdownButton = getByText('Filter');
  await waitFor(() => {
    expect(blueSortDropdownButton).toHaveAttribute('aria-selected', 'true');
  });
});

it('Calls the filters when typing a new name', async () => {
  const setFilters = jest.fn();
  const { getByText, getByPlaceholderText, queryByText, getByTestId } = render(
    <RegularFilterDropdownButton setFilter={setFilters} />,
  );

  const sortDropdownButton = getByText('Filter');
  fireEvent.click(sortDropdownButton);

  const filterByPeople = getByText('People');
  fireEvent.click(filterByPeople);

  const filterSearch = getByPlaceholderText('People');
  fireEvent.click(filterSearch);

  fireEvent.change(filterSearch, { target: { value: 'Jane' } });

  await waitFor(() => {
    const loadingDiv = getByTestId('loading-search-results');
    expect(loadingDiv).toBeDefined();
  });

  await waitFor(() => {
    const firstSearchResult = getByText('Jane Doe');
    expect(firstSearchResult).toBeDefined();

    const alexandreSearchResult = queryByText('Alexandre Prot');
    expect(alexandreSearchResult).not.toBeInTheDocument();
  });

  const filterByJane = getByText('Jane Doe');

  fireEvent.click(filterByJane);

  expect(setFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'Jane Doe',
      value: 'Jane Doe',
      label: 'People',
      operand: {
        id: 'include',
        keyWord: 'ilike',
        label: 'Include',
      },
      icon: <FaUsers />,
    }),
  );
  const blueSortDropdownButton = getByText('Filter');
  await waitFor(() => {
    expect(blueSortDropdownButton).toHaveAttribute('aria-selected', 'true');
  });
});
