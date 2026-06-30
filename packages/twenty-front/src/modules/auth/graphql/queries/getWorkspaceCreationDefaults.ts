import { gql } from '@apollo/client';

export const GET_WORKSPACE_CREATION_DEFAULTS = gql`
  query GetWorkspaceCreationDefaults {
    getWorkspaceCreationDefaults {
      displayName
      subdomain
    }
  }
`;
