import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlPerson } from '../../interfaces/person.interface';

export type OrderBy = Record<string, 'asc' | 'desc'>;

export const GET_PEOPLE = gql`
  query GetPeople($orderBy: [people_order_by!]) {
    people(order_by: $orderBy) {
      id
      phone
      email
      city
      firstname
      lastname
      created_at
      company {
        company_name
        company_domain
      }
    }
  }
`;

export function usePeopleQuery(
  orderBy: OrderBy[],
): QueryResult<{ people: GraphqlPerson[] }> {
  return useQuery<{ people: GraphqlPerson[] }>(GET_PEOPLE, {
    variables: { orderBy },
  });
}
