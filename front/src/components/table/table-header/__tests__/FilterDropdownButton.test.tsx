import { fireEvent, render, waitFor } from '@testing-library/react';
import { RegularFilterDropdownButton } from '../__stories__/FilterDropdownButton.stories';

it('Checks the default top option is Is', async () => {
  const setFilters = jest.fn();
  const { getByText } = render(
    <RegularFilterDropdownButton setFilter={setFilters} />,
  );

  const sortDropdownButton = getByText('Filter');
  fireEvent.click(sortDropdownButton);

  const filterByCompany = getByText('Company');
  fireEvent.click(filterByCompany);

  await waitFor(() => {
    const firstSearchResult = getByText('Airbnb');
    expect(firstSearchResult).toBeDefined();
  });

  const filterByAirbnb = getByText('Airbnb');
  fireEvent.click(filterByAirbnb);

  expect(setFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      displayValue: 'Airbnb',
      key: 'company_name',
      label: 'Company',
    }),
  );
});

it('Checks the selection of top option for Is Not', async () => {
  const setFilters = jest.fn();
  const { getByText } = render(
    <RegularFilterDropdownButton setFilter={setFilters} />,
  );

  const sortDropdownButton = getByText('Filter');
  fireEvent.click(sortDropdownButton);

  const filterByCompany = getByText('Company');
  fireEvent.click(filterByCompany);

  const openOperandOptions = getByText('Is');
  fireEvent.click(openOperandOptions);

  const selectOperand = getByText('Is not');
  fireEvent.click(selectOperand);

  await waitFor(() => {
    const firstSearchResult = getByText('Airbnb');
    expect(firstSearchResult).toBeDefined();
  });

  const filterByAirbnb = getByText('Airbnb');
  fireEvent.click(filterByAirbnb);

  expect(setFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      displayValue: 'Airbnb',
      key: 'company_name',
      label: 'Company',
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

  const filterByCompany = getByText('Company');
  fireEvent.click(filterByCompany);

  const filterSearch = getByPlaceholderText('Company');
  fireEvent.click(filterSearch);

  fireEvent.change(filterSearch, { target: { value: 'Airc' } });

  await waitFor(() => {
    const loadingDiv = getByTestId('loading-search-results');
    expect(loadingDiv).toBeDefined();
  });

  await waitFor(() => {
    const firstSearchResult = getByText('Aircall');
    expect(firstSearchResult).toBeDefined();

    const airbnbResult = queryByText('Airbnb');
    expect(airbnbResult).not.toBeInTheDocument();
  });

  const filterByAircall = getByText('Aircall');

  fireEvent.click(filterByAircall);

  expect(setFilters).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'company_name',
      displayValue: 'Aircall',
      label: 'Company',
    }),
  );
  const blueSortDropdownButton = getByText('Filter');
  await waitFor(() => {
    expect(blueSortDropdownButton).toHaveAttribute('aria-selected', 'true');
  });
});
