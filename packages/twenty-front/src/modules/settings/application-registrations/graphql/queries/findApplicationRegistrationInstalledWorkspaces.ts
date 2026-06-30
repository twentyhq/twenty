import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_INSTALLED_WORKSPACES = gql`
  query FindApplicationRegistrationInstalledWorkspaces(
    $id: String!
    $page: Int
    $searchTerm: String
  ) {
    findApplicationRegistrationInstalledWorkspaces(
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
