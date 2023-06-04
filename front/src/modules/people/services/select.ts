import { gql, QueryResult, useQuery } from '@apollo/client';

import { SelectedSortType } from '@/filters-and-sorts/interfaces/sorts/interface';
import {
  PersonOrderByWithRelationInput as People_Order_By,
  PersonWhereInput as People_Bool_Exp,
  SortOrder,
} from '~/generated/graphql';

import { GraphqlQueryPerson } from '../interfaces/person.interface';

export type PeopleSelectedSortType = SelectedSortType<People_Order_By>;

export const GET_PEOPLE = gql`
  query GetPeople(
    $orderBy: [PersonOrderByWithRelationInput!]
    $where: PersonWhereInput
    $limit: Int
  ) {
    people: findManyPerson(orderBy: $orderBy, where: $where, take: $limit) {
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
