import { gql } from '@apollo/client';

export const GET_PERSON = gql`
  query GetPerson($id: String!) {
    findUniquePerson(id: $id) {
      ...personFieldsFragment
      Favorite {
        id
        person {
          id
        }
        company {
          id
        }
      }
    }
  }
`;
