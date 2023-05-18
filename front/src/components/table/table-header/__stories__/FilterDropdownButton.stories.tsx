import { ThemeProvider } from '@emotion/react';
import { lightTheme } from '../../../../layout/styles/themes';
import { FilterDropdownButton } from '../FilterDropdownButton';
import styled from '@emotion/styled';
import { useCallback, useState } from 'react';
import { SEARCH_COMPANY_QUERY } from '../../../../services/api/search/search';
import { MockedProvider } from '@apollo/client/testing';
import { availableFilters } from '../../../../pages/people/people-filters';
import { Person } from '../../../../interfaces/entities/person.interface';
import {
  FilterableFieldsType,
  SelectedFilterType,
} from '../../../../interfaces/filters/interface';
import { mockCompaniesData } from '../../../../pages/companies/__tests__/__data__/mock-data';

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
      query: SEARCH_COMPANY_QUERY,
      variables: { where: { name: { _ilike: '%%' } }, limit: 5 },
    },
    result: {
      data: {
        searchResults: mockCompaniesData,
      },
    },
  },
  {
    request: {
      query: SEARCH_COMPANY_QUERY,
      variables: { where: { name: { _ilike: '%Airc%' } }, limit: 5 },
    },
    result: {
      data: {
        searchResults: mockCompaniesData.find(
          (company) => company.name === 'Aircall',
        ),
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
