import gql from 'graphql-tag';

export const GET_API_KEY = gql`
  query GetApiKey($input: GetApiKeyDTO!) {
    apiKey(input: $input) {
      id
      name
      createdAt
      expiresAt
      revokedAt
    }
  }
`;
