import { fireEvent, render } from '@testing-library/react';
import { RegularSortDropdownButton } from '../__stories__/SortDropdownButton.stories';
import { FaEnvelope } from 'react-icons/fa';

it('Checks the default top option is Ascending', async () => {
  const setSorts = jest.fn();
  const { getByText } = render(
    <RegularSortDropdownButton setSorts={setSorts} />,
  );

  const sortDropdownButton = getByText('Sort');
  fireEvent.click(sortDropdownButton);

  const sortByEmail = getByText('Email');
  fireEvent.click(sortByEmail);

  expect(setSorts).toHaveBeenCalledWith([
    {
      label: 'Email',
      key: 'email',
      icon: <FaEnvelope />,
      order: 'asc',
    },
  ]);
});

it('Checks the selection of Descending', async () => {
  const setSorts = jest.fn();
  const { getByText } = render(
    <RegularSortDropdownButton setSorts={setSorts} />,
  );

  const sortDropdownButton = getByText('Sort');
  fireEvent.click(sortDropdownButton);

  const openTopOption = getByText('Ascending');
  fireEvent.click(openTopOption);

  const selectDescending = getByText('Descending');
  fireEvent.click(selectDescending);

  const sortByEmail = getByText('Email');
  fireEvent.click(sortByEmail);

  expect(setSorts).toHaveBeenCalledWith([
    {
      label: 'Email',
      key: 'email',
      icon: <FaEnvelope />,
      order: 'desc',
    },
  ]);
});
