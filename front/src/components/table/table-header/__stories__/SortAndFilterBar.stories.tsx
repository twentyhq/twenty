import SortAndFilterBar from '../SortAndFilterBar';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { GET_PEOPLE } from '../../../../api/people';
import { FaArrowDown } from 'react-icons/fa';

const component = {
  title: 'SortAndFilterBar',
  component: SortAndFilterBar,
};

export default component;

type OwnProps = {
  removeFunction: () => void;
  cancelFunction: () => void;
};

export const RegularSortAndFilterBar = ({
  removeFunction,
  cancelFunction,
}: OwnProps) => {
  return (
    <ThemeProvider theme={lightTheme}>
      <SortAndFilterBar
        sorts={[
          {
            label: 'Test sort',
            order: 'asc',
            key: 'test_sort',
            icon: <FaArrowDown />,
            _type: 'default_sort',
          },
          {
            label: 'Test sort 2',
            order: 'desc',
            key: 'test_sort_2',
            icon: <FaArrowDown />,
            _type: 'default_sort',
          },
        ]}
        onRemoveSort={removeFunction}
        onRemoveFilter={removeFunction}
        onCancelClick={cancelFunction}
        filters={[
          {
            label: 'People',
            operand: { label: 'Include', id: 'include', keyWord: 'ilike' },
            key: 'test_filter',
            icon: <FaArrowDown />,
            value: 'John Doe',
            where: {
              firstname: { _ilike: 'John Doe' },
            },
            searchQuery: GET_PEOPLE,
            searchTemplate: () => ({
              firstname: { _ilike: 'John Doe' },
            }),
            whereTemplate: () => {
              return { firstname: { _ilike: 'John Doe' } };
            },
            searchResultMapper: (data) => ({
              displayValue: 'John Doe',
              value: data.firstname,
            }),
            operands: [],
          },
        ]}
      />
    </ThemeProvider>
  );
};
