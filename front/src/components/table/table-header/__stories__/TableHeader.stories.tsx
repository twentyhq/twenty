import TableHeader from '../TableHeader';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FaRegBuilding, FaCalendar } from 'react-icons/fa';
import { SortType } from '../../../../interfaces/sorts/interface';

const component = {
  title: 'TableHeader',
  component: TableHeader,
};

export default component;

export const RegularTableHeader = () => {
  const availableSorts: Array<SortType<Record<'created_at', 'asc'>>> = [
    {
      key: 'created_at',
      label: 'Created at',
      icon: <FaCalendar />,
      _type: 'default_sort',
    },
  ];
  return (
    <ThemeProvider theme={lightTheme}>
      <TableHeader
        viewName="Test"
        viewIcon={<FaRegBuilding />}
        availableSorts={availableSorts}
      />
    </ThemeProvider>
  );
};
