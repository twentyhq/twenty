import TableHeader from '../TableHeader';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { faBuilding, faCalendar } from '@fortawesome/pro-regular-svg-icons';
import { SortType } from '../SortAndFilterBar';

const component = {
  title: 'TableHeader',
  component: TableHeader,
};

export default component;

export const RegularTableHeader = () => {
  const availableSorts: Array<SortType> = [
    {
      id: 'created_at',
      label: 'Created at',
      icon: faCalendar,
    },
  ];
  return (
    <ThemeProvider theme={lightTheme}>
      <TableHeader
        viewName="Test"
        viewIcon={faBuilding}
        availableSorts={availableSorts}
      />
    </ThemeProvider>
  );
};
