import { gql } from '@apollo/client';

import { PERSON_FIELDS_FRAGMENT } from '../fragments/personFieldsFragment';

export const GET_PEOPLE = gql`
  ${PERSON_FIELDS_FRAGMENT}
  query GetPeople(
    $orderBy: [PersonOrderByWithRelationInput!]
    $where: PersonWhereInput
    $limit: Int
  ) {
    people: findManyPerson(orderBy: $orderBy, where: $where, take: $limit) {
      ...personFieldsFragment
    }
  }
`;
