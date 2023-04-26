import { fireEvent, render } from '@testing-library/react';
import { RegularSortDropdownButton } from '../__stories__/SortDropdownButton.stories';
import { faEnvelope } from '@fortawesome/pro-regular-svg-icons';

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
      id: 'email',
      icon: faEnvelope,
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
      id: 'email',
      icon: faEnvelope,
      order: 'desc',
    },
  ]);
});
