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

export const INSERT_ONE_PERSON = gql`
  mutation InsertOnePerson($data: PersonCreateInput!) {
    createOnePerson(data: $data) {
      id
      city
      company {
        domainName
        name
        id
      }
      email
      firstName
      lastName
      jobTitle
      linkedinUrl
      xUrl
      displayName
      phone
      createdAt
    }
  }
`;

export const DELETE_MANY_PERSON = gql`
  mutation DeleteManyPerson($ids: [String!]) {
    deleteManyPerson(where: { id: { in: $ids } }) {
      count
    }
  }
`;
