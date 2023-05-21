import { fireEvent, render } from '@testing-library/react';
import { RegularSortDropdownButton } from '../__stories__/SortDropdownButton.stories';
import { TbBuilding, TbMail } from 'react-icons/tb';

it('Checks the default top option is Ascending', async () => {
  const setSorts = jest.fn();
  const { getByText } = render(
    <RegularSortDropdownButton setSorts={setSorts} />,
  );

  const sortDropdownButton = getByText('Sort');
  fireEvent.click(sortDropdownButton);

  const sortByEmail = getByText('Email');
  fireEvent.click(sortByEmail);

  expect(setSorts).toHaveBeenCalledWith({
    label: 'Email',
    key: 'email',
    icon: <TbMail size={16} />,
    order: 'asc',
    _type: 'default_sort',
  });
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

  expect(setSorts).toHaveBeenCalledWith({
    label: 'Email',
    key: 'email',
    icon: <TbMail size={16} />,
    order: 'desc',
    _type: 'default_sort',
  });
});

it('Checks custom_sort is working', async () => {
  const setSorts = jest.fn();
  const { getByText } = render(
    <RegularSortDropdownButton setSorts={setSorts} />,
  );

  const sortDropdownButton = getByText('Sort');
  fireEvent.click(sortDropdownButton);

  const sortByCompany = getByText('Company');
  fireEvent.click(sortByCompany);

  expect(setSorts).toHaveBeenCalledWith(
    expect.objectContaining({
      key: 'company_name',
      label: 'Company',
      icon: <TbBuilding size={16} />,
      _type: 'custom_sort',
      order: 'asc',
    }),
  );
});
