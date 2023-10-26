import { gql } from '@apollo/client';

export const GET_API_KEYS = gql`
  query GetApiKeys {
    findManyApiKey {
      id
      name
      expiresAt
      createdAt
    }
  }
`;
