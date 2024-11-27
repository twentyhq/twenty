import { gql } from '@apollo/client';

export const query = gql`
  mutation DeleteOnePerson($idToDelete: ID!) {
    deletePerson(id: $idToDelete) {
      __typename
      deletedAt
      id
    }
  }
`;

export const variables = {
  idToDelete: 'a7286b9a-c039-4a89-9567-2dfa7953cda9',
};

export const responseData = {
  __typename: 'Person',
  deletedAt: '2024-02-14T09:45:00Z',
  id: 'a7286b9a-c039-4a89-9567-2dfa7953cda9',
};
