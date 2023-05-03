import SortAndFilterBar from '../SortAndFilterBar';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { faArrowDown } from '@fortawesome/pro-regular-svg-icons';
import { GET_PEOPLE } from '../../../../services/people';
import { People_Bool_Exp } from '../../../../generated/graphql';

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
            icon: faArrowDown,
          },
          {
            label: 'Test sort 2',
            order: 'desc',
            key: 'test_sort_2',
            icon: faArrowDown,
          },
        ]}
        onRemoveSort={removeFunction}
        onRemoveFilter={removeFunction}
        filters={[
          {
            label: 'People',
            operand: { label: 'Include', id: 'include', keyWord: 'ilike' },
            key: 'test_filter',
            icon: faArrowDown,
            value: 'John Doe',
            where: {
              firstname: { _ilike: 'John Doe' },
            },
            searchQuery: GET_PEOPLE,
            searchTemplate: {
              firstname: { _ilike: 'John Doe' },
            },
            whereTemplate: () => {
              return {};
            },
          },
        ]}
      />
    </ThemeProvider>
  );
};
