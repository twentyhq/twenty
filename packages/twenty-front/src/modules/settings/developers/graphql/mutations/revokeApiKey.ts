import gql from 'graphql-tag';

export const REVOKE_API_KEY = gql`
  mutation RevokeApiKey($input: RevokeApiKeyDTO!) {
    revokeApiKey(input: $input) {
      id
    }
  }
`;
