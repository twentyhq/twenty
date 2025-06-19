import gql from 'graphql-tag';

export const CREATE_API_KEY = gql`
  mutation CreateApiKey($input: CreateApiKeyDTO!) {
    createCoreApiKey(input: $input) {
      id
      name
      expiresAt
      revokedAt
    }
  }
`;
