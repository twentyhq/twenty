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

export const INSERT_PERSON_FRAGMENT = gql`
  fragment InsertPersonFragment on Person {
    id
    firstName
    lastName
    displayName
    createdAt
  }
`;

export const INSERT_ONE_PERSON = gql`
  mutation InsertOnePerson($data: PersonCreateInput!) {
    createOnePerson(data: $data) {
      ...InsertPersonFragment
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

export const UPDATE_PERSON_PICTURE = gql`
  mutation UploadPersonPicture($id: String!, $file: Upload!) {
    uploadPersonPicture(id: $id, file: $file)
  }
`;

export const REMOVE_PERSON_PICTURE = gql`
  mutation RemovePersonPicture($where: PersonWhereUniqueInput!) {
    updateOnePerson(data: { avatarUrl: null }, where: $where) {
      id
      avatarUrl
    }
  }
`;
