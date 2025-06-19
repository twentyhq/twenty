import gql from 'graphql-tag';

export const UPDATE_API_KEY = gql`
  mutation UpdateApiKey($input: UpdateApiKeyDTO!) {
    updateCoreApiKey(input: $input) {
      id
      name
      expiresAt
      revokedAt
    }
  }
`;
