import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FilterDropdownButton } from '../FilterDropdownButton';
import styled from '@emotion/styled';
import {
  FilterConfigType,
  FilterableFieldsType,
  SelectedFilterType,
} from '../interface';
import { useCallback, useState } from 'react';
import {
  SEARCH_PEOPLE_QUERY,
  useSearch,
} from '../../../../services/search/search';
import { MockedProvider } from '@apollo/client/testing';
import { mockData } from '../../../../pages/people/__tests__/__data__/mock-data';
import { availableFilters } from '../../../../pages/people/people-table';
import { Person } from '../../../../interfaces/person.interface';

const component = {
  title: 'FilterDropdownButton',
  component: FilterDropdownButton,
};

export default component;

type OwnProps<FilterProperties extends FilterableFieldsType> = {
  setFilter: (filters: SelectedFilterType<FilterProperties>) => void;
};

const mocks = [
  {
    request: {
      query: SEARCH_PEOPLE_QUERY, // TODO this should not be called for empty filters
      variables: {
        where: undefined,
      },
    },
    result: {
      data: {
        searchResults: mockData,
      },
    },
  },
  {
    request: {
      query: SEARCH_PEOPLE_QUERY, // TODO this should not be called for empty filters
      variables: {
        where: {
          _or: [
            { firstname: { _ilike: '%%' } },
            { lastname: { _ilike: '%%' } },
          ],
        },
        limit: 5,
      },
    },
    result: {
      data: {
        searchResults: mockData,
      },
    },
  },
  {
    request: {
      query: SEARCH_PEOPLE_QUERY, // TODO this should not be called for empty filters
      variables: {
        where: {
          _or: [
            { firstname: { _ilike: '%Jane%' } },
            { lastname: { _ilike: '%Jane%' } },
          ],
        },
        limit: 5,
      },
    },
    result: {
      data: {
        searchResults: [mockData.find((p) => p.firstname === 'Jane')],
      },
    },
  },
];

const StyleDiv = styled.div`
  height: 200px;
  width: 200px;
`;

const InnerRegularFilterDropdownButton = ({
  setFilter: setFilters,
}: OwnProps<Person>) => {
  const [, innerSetFilters] = useState<SelectedFilterType<Person>>();
  const [filterSearchResults, setSearhInput, setFilterSearch] = useSearch();

  const outerSetFilters = useCallback(
    (filter: SelectedFilterType<Person>) => {
      innerSetFilters(filter);
      setFilters(filter);
    },
    [setFilters],
  );
  return (
    <StyleDiv>
      <FilterDropdownButton<Person>
        availableFilters={availableFilters}
        isFilterSelected={true}
        onFilterSelect={outerSetFilters}
        filterSearchResults={filterSearchResults}
        onFilterSearch={(filter, searchValue) => {
          setSearhInput(searchValue);
          setFilterSearch(filter);
        }}
      />
    </StyleDiv>
  );
};

export const RegularFilterDropdownButton = ({
  setFilter: setFilters,
}: OwnProps<Person>) => {
  return (
    <MockedProvider mocks={mocks}>
      <ThemeProvider theme={lightTheme}>
        <InnerRegularFilterDropdownButton setFilter={setFilters} />
      </ThemeProvider>
    </MockedProvider>
  );
};
