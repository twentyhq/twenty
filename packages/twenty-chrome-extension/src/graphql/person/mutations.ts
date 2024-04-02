import { gql } from '@apollo/client';

export const CREATE_PERSON = gql`
  mutation CreateOnePerson($input: PersonCreateInput!) {
    createPerson(data: $input) {
      id
    }
  }
`;
