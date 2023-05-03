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

export const parseWhereQuery = (
  whereTemplate: People_Bool_Exp,
  value: string,
): People_Bool_Exp => {
  const whereStringified = JSON.stringify(whereTemplate);
  const whereWithValue = whereStringified.replace('value', value);
  return JSON.parse(whereWithValue);
};

export const useSearch = () => {
  const [filterSearchParams, setFilterSearchParams] = useState<{
    filter: FilterType;
    searchValue: string;
  }>();

  const where = useMemo(() => {
    return (
      filterSearchParams &&
      parseWhereQuery(
        filterSearchParams.filter.whereTemplate,
        filterSearchParams.searchValue,
      )
    );
  }, [filterSearchParams]);

  const searchFilterResults = useQuery(SEARCH_QUERY, {
    variables: {
      where,
    },
  });

  const filterSearchResults = useMemo(() => {
    return (
      searchFilterResults.data?.people.map(
        (person: GraphqlQueryPerson) => person.firstname,
      ) || []
    );
  }, [searchFilterResults.data?.people]);

  return [filterSearchResults, setFilterSearchParams];
};
