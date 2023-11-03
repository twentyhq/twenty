import { gql } from '@apollo/client';

export const DELETE_ONE_API_KEY = gql`
  mutation DeleteOneApiKey($apiKeyId: String!) {
    revokeOneApiKey(where: { id: $apiKeyId }) {
      id
    }
  }
`;
