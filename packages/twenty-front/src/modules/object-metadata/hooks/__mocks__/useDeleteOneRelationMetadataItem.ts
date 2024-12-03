import { gql } from '@apollo/client';

export const query = gql`
  mutation DeleteOneRelationMetadataItem($idToDelete: UUID!) {
    deleteOneRelation(input: { id: $idToDelete }) {
      id
    }
  }
`;

export const variables = { idToDelete: 'idToDelete' };

export const responseData = {
  id: 'idToDelete',
};
