import TableHeader from '../TableHeader';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FaRegBuilding, FaCalendar } from 'react-icons/fa';
import { SortType } from '../interface';

const component = {
  title: 'TableHeader',
  component: TableHeader,
};

export default component;

export const RegularTableHeader = () => {
  const availableSorts: Array<SortType> = [
    {
      key: 'created_at',
      label: 'Created at',
      icon: <FaCalendar />,
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
