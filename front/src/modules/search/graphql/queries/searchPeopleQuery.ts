import { gql } from '@apollo/client';

export const SEARCH_PEOPLE_QUERY = gql`
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
      id
      phone
      email
      city
      firstName
      lastName
      displayName
      company {
        id
      }
      avatarUrl
      createdAt
    }
  }
`;
