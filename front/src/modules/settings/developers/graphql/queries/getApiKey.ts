import { gql } from '@apollo/client';

export const GET_API_KEY = gql`
  query GetApiKey($apiKeyId: String!) {
    findManyApiKey(where: { id: { equals: $apiKeyId } }) {
      id
      name
      expiresAt
      createdAt
    }
  }
`;
