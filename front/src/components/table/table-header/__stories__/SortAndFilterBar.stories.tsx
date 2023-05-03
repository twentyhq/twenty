import SortAndFilterBar from '../SortAndFilterBar';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FaArrowDown } from 'react-icons/fa';

const component = {
  title: 'SortAndFilterBar',
  component: SortAndFilterBar,
};

export default component;

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
            key: 'test_sort',
            icon: <FaArrowDown />,
          },
          {
            label: 'Test sort 2',
            order: 'desc',
            key: 'test_sort_2',
            icon: <FaArrowDown />,
          },
        ]}
        onRemoveSort={removeFunction}
        onRemoveFilter={removeFunction}
        filters={[
          {
            label: 'People',
            operand: { id: 'include', label: 'Include' },
            id: 'test_filter',
            icon: <FaArrowDown />,
            value: 'John Doe',
          },
        ]}
      />
    </ThemeProvider>
  );
};
