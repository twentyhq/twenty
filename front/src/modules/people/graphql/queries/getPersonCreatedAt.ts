import { gql } from '@apollo/client';

export const GET_PERSON_CREATED_AT = gql`
  query GetPersonCreatedAtById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      createdAt
    }
  }
`;
