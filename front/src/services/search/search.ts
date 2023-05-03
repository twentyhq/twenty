import { DocumentNode, QueryResult, gql, useLazyQuery } from '@apollo/client';
import { People_Bool_Exp } from '../../generated/graphql';
import { GraphqlQueryPerson } from '../../interfaces/person.interface';
import {} from '../../interfaces/company.interface';

export const SEARCH_QUERY = gql`
  query SearchQuery(
    $where: people_bool_exp
    $limit: Int
    $isPersonSearch: Boolean!
    $isCompanySearch: Boolean!
  ) {
    people(where: $where, limit: $limit) @include(if: $isPersonSearch) {
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
    companies(where: $where, limit: $limit) @include(if: $isCompanySearch) {
      id
      name
    }
  }
`;

export const parseWhereQuery = (
  whereTemplate: People_Bool_Exp,
  value: string,
): People_Bool_Exp => {
  const whereStringified = JSON.stringify(whereTemplate);
  const whereWithValue = whereStringified.replace('%value%', value);
  console.log(whereWithValue);
  return JSON.parse(whereWithValue);
};

export const useLazySearch = (): [
  (where: People_Bool_Exp) => Promise<QueryResult<any>>,
  Partial<QueryResult<any>>,
] => {
  const [searchLazyQuery, { loading, error, data }] = useLazyQuery<{
    people: GraphqlQueryPerson[];
  }>(SEARCH_QUERY);

  const searchQuery = (where: People_Bool_Exp) => {
    return searchLazyQuery({
      variables: {
        isPersonSearch: true,
        isCompanySearch: false,
        where,
      },
    });
  };

  return [searchQuery, { loading, error, data }];
};
