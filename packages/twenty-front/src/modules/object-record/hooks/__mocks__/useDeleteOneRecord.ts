import { gql } from '@apollo/client';

export const query = gql`
  mutation DeleteOnePerson($idToDelete: UUID!) {
    deletePerson(id: $idToDelete) {
      __typename
      deletedAt
      id
    }
  }
`;