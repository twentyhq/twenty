import { gql } from '@apollo/client';

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
      firstName
      lastName
      displayName
      jobTitle
      linkedinUrl
      xUrl
      avatarUrl
      createdAt
      _activityCount
      company {
        id
        name
        domainName
      }
    }
  }
`;
