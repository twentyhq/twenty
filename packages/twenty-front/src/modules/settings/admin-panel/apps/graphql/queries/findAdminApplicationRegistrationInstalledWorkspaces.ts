import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_INSTALLED_WORKSPACES = gql`
  query FindAdminApplicationRegistrationInstalledWorkspaces(
    $input: FindApplicationRegistrationInstalledWorkspacesInput!
  ) {
    findAdminApplicationRegistrationInstalledWorkspaces(input: $input) {
      totalCount
      hasMore
      workspaces {
        id
        displayName
        logo
        version
      }
    }
  }
`;
