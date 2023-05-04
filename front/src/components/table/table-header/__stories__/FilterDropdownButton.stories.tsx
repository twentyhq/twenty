import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FilterDropdownButton } from '../FilterDropdownButton';
import styled from '@emotion/styled';
import { FilterType, SelectedFilterType } from '../interface';
import { useCallback, useState } from 'react';
import { People_Bool_Exp } from '../../../../generated/graphql';
import { FaUsers } from 'react-icons/fa';
import {
  SEARCH_PEOPLE_QUERY,
  useSearch,
} from '../../../../services/search/search';
import { MockedProvider } from '@apollo/client/testing';
import { defaultData } from '../../../../pages/people/default-data';

const component = {
  title: 'FilterDropdownButton',
  component: FilterDropdownButton,
};

export default component;

type OwnProps<FilterProperties> = {
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
        searchResults: defaultData,
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
      },
    },
    result: {
      data: {
        searchResults: defaultData,
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
      },
    },
    result: {
      data: {
        searchResults: [defaultData.find((p) => p.firstname === 'Jane')],
      },
    },
  },
];

const availableFilters = [
  {
    key: 'fullname',
    label: 'People',
    icon: <FaUsers />,
    searchQuery: SEARCH_PEOPLE_QUERY,
    searchTemplate: (searchInput: string) => ({
      _or: [
        { firstname: { _ilike: `%${searchInput}%` } },
        { lastname: { _ilike: `%${searchInput}%` } },
      ],
    }),
    whereTemplate: () => ({
      _or: [
        { firstname: { _ilike: 'value' } },
        { lastname: { _ilike: 'value' } },
      ],
    }),
    searchResultMapper: (data) => ({
      displayValue: data.firstname + ' ' + data.lastname,
      value: data.firstname,
    }),
  },
] satisfies FilterType<People_Bool_Exp>[];

const StyleDiv = styled.div`
  height: 200px;
  width: 200px;
`;

const InnerRegularFilterDropdownButton = ({
  setFilter: setFilters,
}: OwnProps<People_Bool_Exp>) => {
  const [, innerSetFilters] = useState<SelectedFilterType<People_Bool_Exp>>();
  const [filterSearchResults, setSearhInput, setFilterSearch] = useSearch();

  const outerSetFilters = useCallback(
    (filter: SelectedFilterType<People_Bool_Exp>) => {
      innerSetFilters(filter);
      setFilters(filter);
    },
    [setFilters],
  );
  return (
    <StyleDiv>
      <FilterDropdownButton
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
}: OwnProps<People_Bool_Exp>) => {
  return (
    <MockedProvider mocks={mocks}>
      <ThemeProvider theme={lightTheme}>
        <InnerRegularFilterDropdownButton setFilter={setFilters} />
      </ThemeProvider>
    </MockedProvider>
  );
};
