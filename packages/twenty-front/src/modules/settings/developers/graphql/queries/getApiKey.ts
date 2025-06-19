import gql from 'graphql-tag';

export const GET_API_KEY = gql`
  query GetApiKey($input: GetApiKeyDTO!) {
    coreApiKey(input: $input) {
      id
      name
      expiresAt
      revokedAt
    }
  }
`;
