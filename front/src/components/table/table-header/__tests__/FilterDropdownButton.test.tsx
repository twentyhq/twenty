import { fireEvent, render, waitFor } from '@testing-library/react';
import { RegularFilterDropdownButton } from '../__stories__/FilterDropdownButton.stories';
import { faEnvelope } from '@fortawesome/pro-regular-svg-icons';

it('Checks the default top option is Include', async () => {
  const setSorts = jest.fn();
  const { getByText } = render(
    <RegularFilterDropdownButton setFilters={setSorts} />,
  );

  const sortDropdownButton = getByText('Filter');
  fireEvent.click(sortDropdownButton);

  const sortByEmail = getByText('Email');
  fireEvent.click(sortByEmail);

  const filterByJohn = getByText('John Doe');
  fireEvent.click(filterByJohn);

  expect(setSorts).toHaveBeenCalledWith([
    {
      id: 'John Doe',
      value: 'John Doe',
      label: 'Email',
      operand: { id: 'include', label: 'Include' },
      icon: faEnvelope,
    },
  ]);
});

it('Checks the selection of top option for Doesnot include', async () => {
  const setSorts = jest.fn();
  const { getByText } = render(
    <RegularFilterDropdownButton setFilters={setSorts} />,
  );

  const sortDropdownButton = getByText('Filter');
  fireEvent.click(sortDropdownButton);

  const sortByEmail = getByText('Email');
  fireEvent.click(sortByEmail);

  const openOperandOptions = getByText('Include');
  fireEvent.click(openOperandOptions);

  const selectOperand = getByText("Doesn't include");
  fireEvent.click(selectOperand);

  const filterByJohn = getByText('John Doe');
  fireEvent.click(filterByJohn);

  expect(setSorts).toHaveBeenCalledWith([
    {
      id: 'John Doe',
      value: 'John Doe',
      label: 'Email',
      operand: { id: 'not-include', label: "Doesn't include" },
      icon: faEnvelope,
    },
  ]);

  const blueSortDropdownButton = getByText('Filter');
  await waitFor(() => {
    expect(blueSortDropdownButton).toHaveAttribute('aria-selected', 'true');
  });
});
