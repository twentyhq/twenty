import SortAndFilterBar from '../SortAndFilterBar';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { faArrowDown } from '@fortawesome/pro-regular-svg-icons';

export default {
  title: 'SortAndFilterBar',
  component: SortAndFilterBar,
};

type OwnProps = {
  removeFunction: () => void;
};

export const RegularSortAndFilterBar = ({ removeFunction }: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <SortAndFilterBar
        sorts={[
          {
            label: 'Test sort',
            order: 'asc',
            id: 'test_sort',
            icon: faArrowDown,
          },
          {
            label: 'Test sort 2',
            order: 'desc',
            id: 'test_sort_2',
            icon: faArrowDown,
          },
        ]}
        onRemoveSort={removeFunction}
      />
    </ThemeProvider>
  );
};
