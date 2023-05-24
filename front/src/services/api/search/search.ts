import { gql, useQuery } from '@apollo/client';
import { useMemo, useState } from 'react';
import { SearchConfigType } from '../../../interfaces/search/interface';
import {
  AnyEntity,
  UnknownType,
} from '../../../interfaces/entities/generic.interface';

export const SEARCH_PEOPLE_QUERY = gql`
  query SearchPeopleQuery($where: PersonWhereInput, $limit: Int) {
    searchResults: people(where: $where, take: $limit) {
      id
      phone
      email
      city
      firstname
      lastname
      createdAt
    }
  }
`;

export const SEARCH_USER_QUERY = gql`
  query SearchUserQuery($where: UserWhereInput, $limit: Int) {
    searchResults: users(where: $where, take: $limit) {
      id
      email
      displayName
    }
  }
`;
// TODO: remove this query
export const EMPTY_QUERY = gql`
  query EmptyQuery {
    users {
      id
    }
  }
`;

export const SEARCH_COMPANY_QUERY = gql`
  query SearchQuery($where: CompanyWhereInput, $limit: Int) {
    searchResults: companies(where: $where, take: $limit) {
      id
      name
      domainName
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

export type SearchResultsType<T extends AnyEntity | UnknownType = UnknownType> =
  {
    results: {
      render: (value: T) => string;
      value: T;
    }[];
    loading: boolean;
  };

export const useSearch = <T extends AnyEntity | UnknownType = UnknownType>(): [
  SearchResultsType<T>,
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

  const searchQueryResults = useQuery(searchConfig?.query || EMPTY_QUERY, {
    variables: {
      where,
      limit: 5,
    },
    skip: !searchConfig,
  });

  const searchResults = useMemo<{
    results: { render: (value: T) => string; value: any }[];
    loading: boolean;
  }>(() => {
    if (searchConfig == null) {
      return {
        loading: false,
        results: [],
      };
    }
    if (searchQueryResults.loading) {
      return {
        loading: true,
        results: [],
      };
    }
    return {
      loading: false,
      results: searchQueryResults.data.searchResults.map(
        searchConfig.resultMapper,
      ),
    };
  }, [searchConfig, searchQueryResults]);

  return [searchResults, debouncedsetSearchInput, setSearchConfig];
};
