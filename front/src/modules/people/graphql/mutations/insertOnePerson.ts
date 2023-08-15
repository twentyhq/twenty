import { gql } from '@apollo/client';

export const INSERT_ONE_PERSON = gql`
  mutation InsertOnePerson($data: PersonCreateInput!) {
    createOnePerson(data: $data) {
      ...InsertPersonFragment
    }
  }
`;
