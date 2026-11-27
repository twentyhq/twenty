import { WORKSPACE_INSTALLED_APPLICATION_FRAGMENT } from '@/applications/graphql/fragments/workspaceInstalledApplicationFragment';
import { gql } from '@apollo/client';

export const GET_WORKSPACE_INSTALLED_APPLICATIONS = gql`
  query GetWorkspaceInstalledApplications {
    currentWorkspace {
      id
      installedApplications {
        ...WorkspaceInstalledApplication
      }
    }
  }
  ${WORKSPACE_INSTALLED_APPLICATION_FRAGMENT}
`;
