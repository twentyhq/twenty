import { useMemo, useState } from 'react';
import { gql, useQuery } from '@apollo/client';

import { filterSearchInputScopedState } from '@/filters-and-sorts/states/filterSearchInputScopedState';
import { useRecoilScopedState } from '@/recoil-scope/hooks/useRecoilScopedState';
import { TableContext } from '@/ui/tables/states/TableContext';
import { debounce } from '@/utils/debounce';

import { SearchConfigType } from '../interfaces/interface';

export const SEARCH_PEOPLE_QUERY = gql`
  query SearchPeople(
    $where: PersonWhereInput
    $limit: Int
    $orderBy: [PersonOrderByWithRelationInput!]
  ) {
    searchResults: findManyPerson(
      where: $where
      take: $limit
      orderBy: $orderBy
    ) {
      id
      phone
      email
      city
      firstName
      lastName
      createdAt
    }
  }
`;

export const SEARCH_USER_QUERY = gql`
  query SearchUser(
    $where: UserWhereInput
    $limit: Int
    $orderBy: [UserOrderByWithRelationInput!]
  ) {
    searchResults: findManyUser(
      where: $where
      take: $limit
      orderBy: $orderBy
    ) {
      id
      email
      displayName
    }
  }
`;
// TODO: remove this query
export const EMPTY_QUERY = gql`
  query EmptyQuery {
    searchResults: findManyUser {
      id
    }
  }
`;

export const SEARCH_COMPANY_QUERY = gql`
  query SearchCompany(
    $where: CompanyWhereInput
    $limit: Int
    $orderBy: [CompanyOrderByWithRelationInput!]
  ) {
    searchResults: findManyCompany(
      where: $where
      take: $limit
      orderBy: $orderBy
    ) {
      id
      name
      domainName
    }
  }
`;

export type SearchResultsType<T> = {
  results: {
    render: (value: T) => string;
    value: T;
  }[];
  loading: boolean;
};

type SearchArgs = {
  currentSelectedId?: string | null;
};

export const useSearch = <T>(
  searchArgs?: SearchArgs,
): [
  SearchResultsType<T>,
  React.Dispatch<React.SetStateAction<string>>,
  React.Dispatch<React.SetStateAction<SearchConfigType | null>>,
  string,
] => {
  const [searchConfig, setSearchConfig] = useState<SearchConfigType | null>(
    null,
  );
  const [searchInput, setSearchInput] = useRecoilScopedState(
    filterSearchInputScopedState,
    TableContext,
  );

  const debouncedsetSearchInput = useMemo(
    () => debounce(setSearchInput, 50),
    [],
  );

  const where = useMemo(() => {
    return (
      searchConfig &&
      searchConfig.template &&
      searchConfig.template(
        searchInput,
        searchArgs?.currentSelectedId ?? undefined,
      )
    );
  }, [searchConfig, searchInput, searchArgs]);

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
      // TODO: add proper typing
      results: searchQueryResults?.data?.searchResults?.map(
        searchConfig.resultMapper,
      ),
    };
  }, [searchConfig, searchQueryResults]);

  return [searchResults, debouncedsetSearchInput, setSearchConfig, searchInput];
};
