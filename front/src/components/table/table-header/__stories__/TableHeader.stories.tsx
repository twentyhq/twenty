import TableHeader from '../TableHeader';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { SortType } from '../../../../interfaces/sorts/interface';
import { MockedProvider } from '@apollo/client/testing';
import { EMPTY_QUERY } from '../../../../services/api/search/search';
import { TbBuilding, TbCalendar } from 'react-icons/tb';

const component = {
  title: 'TableHeader',
  component: TableHeader,
};
const mocks = [
  {
    request: {
      query: EMPTY_QUERY,
      variables: {
        where: undefined,
      },
    },
    result: {
      data: {
        searchResults: [],
      },
    },
  },
];

export default component;

export const RegularTableHeader = () => {
  const availableSorts: Array<SortType<Record<'created_at', 'asc'>>> = [
    {
      key: 'created_at',
      label: 'Created at',
      icon: <TbCalendar size={16} />,
      _type: 'default_sort',
    },
  ];
  return (
    <MockedProvider mocks={mocks}>
      <ThemeProvider theme={lightTheme}>
        <TableHeader
          viewName="Test"
          viewIcon={<TbBuilding size={16} />}
          availableSorts={availableSorts}
        />
      </ThemeProvider>
    </MockedProvider>
  );
};
