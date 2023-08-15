import { gql } from '@apollo/client';

export const GET_PERSON_EMAIL = gql`
  query GetPersonEmailById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      email
    }
  }
`;
