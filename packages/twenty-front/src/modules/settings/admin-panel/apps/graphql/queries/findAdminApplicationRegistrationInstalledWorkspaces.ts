import { gql } from '@apollo/client';

export const FIND_ADMIN_APPLICATION_REGISTRATION_INSTALLED_WORKSPACES = gql`
  query FindAdminApplicationRegistrationInstalledWorkspaces(
    $id: String!
    $page: Int
    $searchTerm: String
  ) {
    findAdminApplicationRegistrationInstalledWorkspaces(
      id: $id
      page: $page
      searchTerm: $searchTerm
    ) {
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
