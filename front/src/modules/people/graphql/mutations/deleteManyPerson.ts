import { gql } from '@apollo/client';

export const DELETE_MANY_PERSON = gql`
  mutation DeleteManyPerson($ids: [String!]) {
    deleteManyPerson(where: { id: { in: $ids } }) {
      count
    }
  }
`;
