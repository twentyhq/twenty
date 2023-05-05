import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryPerson } from '../../interfaces/person.interface';
import {
  Order_By,
  People_Bool_Exp,
  People_Order_By,
} from '../../generated/graphql';
import { SelectedSortType } from '../../components/table/table-header/interface';

export type PeopleSelectedSortType = SelectedSortType<People_Order_By>;

export const GET_PEOPLE = gql`
  query GetPeople(
    $orderBy: [people_order_by!]
    $where: people_bool_exp
    $limit: Int
  ) {
    people(order_by: $orderBy, where: $where, limit: $limit) {
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

export function usePeopleQuery(
  orderBy: People_Order_By[],
  where: People_Bool_Exp,
): QueryResult<{ people: GraphqlQueryPerson[] }> {
  return useQuery<{ people: GraphqlQueryPerson[] }>(GET_PEOPLE, {
    variables: { orderBy, where },
  });
}

export const defaultOrderBy: People_Order_By[] = [
  {
    created_at: Order_By.Desc,
  },
];
