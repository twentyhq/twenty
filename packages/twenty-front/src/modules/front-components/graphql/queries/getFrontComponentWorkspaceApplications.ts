import { gql } from '@apollo/client';

export const GET_FRONT_COMPONENT_WORKSPACE_APPLICATIONS = gql`
  query GetFrontComponentWorkspaceApplications {
    currentWorkspace {
      id
      installedApplications {
        id
      }
    }
  }
`;
