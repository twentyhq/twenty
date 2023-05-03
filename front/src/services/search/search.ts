import { gql } from '@apollo/client';
import { People_Bool_Exp } from '../../generated/graphql';
import {} from '../../interfaces/company.interface';

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
