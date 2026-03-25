import gql from 'graphql-tag';

export const REVOKE_API_KEY = gql`
  mutation RevokeApiKey($input: RevokeApiKeyInput!) {
    revokeApiKey(input: $input) {
      id
    }
  }
`;
