import gql from 'graphql-tag';

export const REMOVE_ROLE_FROM_API_KEY = gql`
  mutation RemoveRoleFromApiKey($apiKeyId: String!) {
    removeRoleFromApiKey(apiKeyId: $apiKeyId)
  }
`;
