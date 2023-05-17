import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import {
  SearchConfigType,
  SearchableType,
} from '../../components/table/table-header/interface';

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

export const SEARCH_USER_QUERY = gql`
  query SearchQuery($where: users_bool_exp, $limit: Int) {
    searchResults: users(where: $where, limit: $limit) {
      id
      email
      displayName
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
      domain_name
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

export const useSearch = <T extends SearchableType>(): [
  {
    results: {
      render: (value: T) => string;
      value: T;
    }[];
    loading: boolean;
  },
  React.Dispatch<React.SetStateAction<string>>,
  React.Dispatch<React.SetStateAction<SearchConfigType<T> | null>>,
] => {
  const [searchConfig, setSearchConfig] = useState<SearchConfigType<T> | null>(
    null,
  );
  const [searchInput, setSearchInput] = useState<string>('');

  const debouncedsetSearchInput = useMemo(
    () => debounce(setSearchInput, 500),
    [],
  );

  const where = useMemo(() => {
    return (
      searchConfig &&
      searchConfig.template &&
      searchConfig.template(searchInput)
    );
  }, [searchConfig, searchInput]);

  const searchFilterQueryResults = useQuery(
    searchConfig?.query || EMPTY_QUERY,
    {
      variables: {
        where,
        limit: 5,
      },
      skip: !searchConfig,
    },
  );

  const searchFilterResults = useMemo<{
    results: { render: (value: T) => string; value: any }[];
    loading: boolean;
  }>(() => {
    if (searchConfig == null) {
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
        searchConfig.resultMapper,
      ),
    };
  }, [searchConfig, searchFilterQueryResults]);

  return [searchFilterResults, debouncedsetSearchInput, setSearchConfig];
};
