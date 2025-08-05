import gql from 'graphql-tag';

export const ASSIGN_ROLE_TO_API_KEY = gql`
  mutation AssignRoleToApiKey($apiKeyId: UUID!, $roleId: UUID!) {
    assignRoleToApiKey(apiKeyId: $apiKeyId, roleId: $roleId)
  }
`;
