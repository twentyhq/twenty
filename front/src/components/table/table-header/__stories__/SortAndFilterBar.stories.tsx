import SortAndFilterBar from '../SortAndFilterBar';
import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FaArrowDown } from 'react-icons/fa';
import { SelectedFilterType } from '../interface';
import { Person } from '../../../../interfaces/person.interface';
import { Company } from '../../../../interfaces/company.interface';

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
            operand: {
              label: 'Include',
              id: 'include',
              whereTemplate: (person) => {
                return { email: { _eq: person.email } };
              },
            },
            key: 'test_filter',
            icon: <FaArrowDown />,
            displayValue: 'john@doedoe.com',
            value: {
              id: 'test',
              email: 'john@doedoe.com',
              firstname: 'John',
              lastname: 'Doe',
              phone: '123456789',
              company: null,
              creationDate: new Date(),
              pipes: null,
              city: 'Paris',
            },
          } satisfies SelectedFilterType<Person, Person>,
        ]}
      />
    </ThemeProvider>
  );
};
