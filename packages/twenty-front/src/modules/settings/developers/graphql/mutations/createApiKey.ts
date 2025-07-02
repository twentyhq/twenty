import gql from 'graphql-tag';

export const CREATE_API_KEY = gql`
  mutation CreateApiKey($input: CreateApiKeyDTO!) {
    createApiKey(input: $input) {
      id
      name
      expiresAt
      revokedAt
    }
  }
`;
