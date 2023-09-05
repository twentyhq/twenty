import { gql } from '@apollo/client';

export const UPDATE_ONE_PERSON = gql`
  mutation UpdateOnePerson(
    $where: PersonWhereUniqueInput!
    $data: PersonUpdateInput!
  ) {
    updateOnePerson(data: $data, where: $where) {
      id
      city
      company {
        domainName
        name
        id
      }
      avatarUrl
      email
      jobTitle
      linkedinUrl
      xUrl
      firstName
      lastName
      displayName
      phone
      createdAt
    }
  }
`;
