import TableHeader from '../TableHeader';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { faBuilding } from '@fortawesome/pro-regular-svg-icons';

const component = {
  title: 'TableHeader',
  component: TableHeader,
};

export default component;

export const RegularTableHeader = () => {
  return (
    <ThemeProvider theme={lightTheme}>
      <TableHeader viewName="Test" viewIcon={faBuilding} />
    </ThemeProvider>
  );
};
