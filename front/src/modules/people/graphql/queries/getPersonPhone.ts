import { gql } from '@apollo/client';

export const GET_PERSON_PHONE = gql`
  query GetPersonPhoneById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      phone
    }
  }
`;
