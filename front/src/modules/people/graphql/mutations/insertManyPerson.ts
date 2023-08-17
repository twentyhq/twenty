import { gql } from '@apollo/client';

export const INSERT_MANY_PERSON = gql`
  mutation InsertManyPerson($data: [PersonCreateManyInput!]!) {
    createManyPerson(data: $data) {
      count
    }
  }
`;
