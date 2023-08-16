import { gql } from '@apollo/client';

export const GET_PERSON_CITY = gql`
  query GetPersonCityById($id: String!) {
    person: findUniquePerson(id: $id) {
      id
      city
    }
  }
`;
