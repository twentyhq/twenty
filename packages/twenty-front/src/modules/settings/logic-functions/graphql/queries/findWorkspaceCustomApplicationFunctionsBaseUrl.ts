import { gql } from '@apollo/client';

export const FIND_WORKSPACE_CUSTOM_APPLICATION_FUNCTIONS_BASE_URL = gql`
  query FindWorkspaceCustomApplicationFunctionsBaseUrl {
    currentUser {
      id
      currentWorkspace {
        id
        workspaceCustomApplication {
          id
          functionsBaseUrl
        }
      }
    }
  }
`;
