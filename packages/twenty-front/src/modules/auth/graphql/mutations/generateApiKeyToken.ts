import { gql } from '@apollo/client';

export const GENERATE_ONE_API_KEY_TOKEN = gql`
  mutation GenerateApiKeyToken($apiKeyId: UUID!, $expiresAt: String!) {
    generateApiKeyToken(apiKeyId: $apiKeyId, expiresAt: $expiresAt) {
      token
    }
  }
`;
