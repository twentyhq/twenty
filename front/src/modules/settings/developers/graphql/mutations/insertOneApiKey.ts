import { gql } from '@apollo/client';

export const INSERT_ONE_API_KEY = gql`
  mutation InsertOneApiKey($data: ApiKeyCreateInput!) {
    createOneApiKey(data: $data) {
      id
      token
      expiresAt
    }
  }
`;
