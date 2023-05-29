import { QueryResult, gql, useQuery } from '@apollo/client';
import { GraphqlQueryPerson } from '../../../interfaces/entities/person.interface';
import {
  PersonWhereInput as People_Bool_Exp,
  PersonOrderByWithRelationInput as People_Order_By,
  SortOrder,
} from '../../../generated/graphql';
import { SelectedSortType } from '../../../interfaces/sorts/interface';

export type PeopleSelectedSortType = SelectedSortType<People_Order_By>;

export const GET_PEOPLE = gql`
  query GetPeople(
    $orderBy: [PersonOrderByWithRelationInput!]
    $where: PersonWhereInput
    $limit: Int
  ) {
    people(orderBy: $orderBy, where: $where, take: $limit) {
      id
      phone
      email
      city
      firstname
      lastname
      createdAt
      company {
        id
        name
        domainName
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
    createdAt: SortOrder.Desc,
  },
];
