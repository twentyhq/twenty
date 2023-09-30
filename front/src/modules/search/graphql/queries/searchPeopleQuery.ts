import { gql } from '@apollo/client';

import { BASE_PERSON_FIELDS_FRAGMENT } from '@/people/graphql/fragments/personFieldsFragment';

export const SEARCH_PEOPLE_QUERY = gql`
  ${BASE_PERSON_FIELDS_FRAGMENT}
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
      ...basePersonFieldsFragment
    }
  }
`;
