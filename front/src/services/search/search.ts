import { gql, useQuery } from '@apollo/client';
import { People_Bool_Exp } from '../../generated/graphql';
import {} from '../../interfaces/company.interface';
import { useMemo, useState } from 'react';
import { GraphqlQueryPerson } from '../../interfaces/person.interface';
import { FilterType } from '../../components/table/table-header/interface';

export const SEARCH_QUERY = gql`
  query SearchQuery($where: people_bool_exp, $limit: Int) {
    people(where: $where, limit: $limit) {
      id
      phone
      email
      city
      firstname
      lastname
      created_at
      company {
        id
        name
        domain_name
      }
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

export const parseWhereQuery = (
  whereTemplate: People_Bool_Exp,
  value: string,
): People_Bool_Exp => {
  const whereStringified = JSON.stringify(whereTemplate);
  const whereWithValue = whereStringified.replace('value', value);
  return JSON.parse(whereWithValue);
};

type SearchAndFilter = {
  filter: FilterType<People_Bool_Exp> | null;
  searchValue: string;
};

export const useSearch = (): [
  { results: { displayValue: string; value: any }[]; loading: boolean },
  (value: React.SetStateAction<SearchAndFilter | undefined>) => void,
] => {
  const [filterSearchParams, setFilterSearchParams] =
    useState<SearchAndFilter>();

  const debouncedSetFilterSearchParams = useMemo(
    () => debounce(setFilterSearchParams, 500),
    [],
  );

  const where = useMemo(() => {
    return (
      filterSearchParams &&
      filterSearchParams.filter &&
      parseWhereQuery(
        filterSearchParams.filter.searchTemplate,
        filterSearchParams.searchValue,
      )
    );
  }, [filterSearchParams]);

  const searchFilterQueryResults = useQuery(SEARCH_QUERY, {
    variables: {
      where,
    },
  });

  const searchFilterResults = useMemo<{
    results: { displayValue: string; value: any }[];
    loading: boolean;
  }>(() => {
    if (searchFilterQueryResults.loading) {
      return {
        loading: true,
        results: [],
      };
    }
    return (
      {
        loading: false,
        results: searchFilterQueryResults.data?.people.map(
          (person: GraphqlQueryPerson) => ({
            displayValue: `${person.firstname} ${person.lastname}`,
            value: { firstname: person.firstname, lastname: person.lastname },
          }),
        ),
      } || { loading: false, results: [] }
    );
  }, [searchFilterQueryResults]);

  return [searchFilterResults, debouncedSetFilterSearchParams];
};
