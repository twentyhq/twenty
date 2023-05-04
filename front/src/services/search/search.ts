import { gql, useQuery } from '@apollo/client';
import { People_Bool_Exp } from '../../generated/graphql';
import {} from '../../interfaces/company.interface';
import { useMemo, useState } from 'react';
import { FilterType } from '../../components/table/table-header/interface';

export const SEARCH_PEOPLE_QUERY = gql`
  query SearchQuery($where: people_bool_exp, $limit: Int) {
    searchResults: people(where: $where, limit: $limit) {
      id
      phone
      email
      city
      firstname
      lastname
      created_at
    }
  }
`;

const EMPTY_QUERY = gql`
  query EmptyQuery {
    _
  }
`;

export const SEARCH_COMPANY_QUERY = gql`
  query SearchQuery($where: companies_bool_exp, $limit: Int) {
    searchResults: companies(where: $where, limit: $limit) {
      id
      name
    }
  }
`;

const debounce = <FuncArgs extends any[]>(
  func: (...args: FuncArgs) => void,
  delay: number,
) => {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: FuncArgs) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      func(...args);
    }, delay);
  };
};

export const useSearch = (): [
  { results: { displayValue: string; value: any }[]; loading: boolean },
  React.Dispatch<React.SetStateAction<string>>,
  React.Dispatch<React.SetStateAction<FilterType<People_Bool_Exp> | null>>,
] => {
  const [filter, setFilter] = useState<FilterType<People_Bool_Exp> | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState<string>('');

  const debouncedsetSearchInput = useMemo(
    () => debounce(setSearchInput, 500),
    [],
  );

  const where = useMemo(() => {
    return (
      filter && filter.searchTemplate && filter.searchTemplate(searchInput)
    );
  }, [filter, searchInput]);

  const searchFilterQueryResults = useQuery(
    filter?.searchQuery || EMPTY_QUERY,
    {
      variables: {
        where,
      },
      skip: !filter,
    },
  );

  const searchFilterResults = useMemo<{
    results: { displayValue: string; value: any }[];
    loading: boolean;
  }>(() => {
    if (filter == null) {
      return {
        loading: false,
        results: [],
      };
    }
    if (searchFilterQueryResults.loading) {
      return {
        loading: true,
        results: [],
      };
    }
    return {
      loading: false,
      results: searchFilterQueryResults.data.searchResults.map(
        filter.searchResultMapper,
      ),
    };
  }, [filter, searchFilterQueryResults]);

  return [searchFilterResults, debouncedsetSearchInput, setFilter];
};
