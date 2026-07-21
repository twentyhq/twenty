import gql from 'graphql-tag';

export const GET_API_KEY_ROLES = gql`
  query GetApiKeyRoles {
    getApiKeyRoles {
      id
      label
      icon
      canBeAssignedToApiKeys
    }
  }
`;
