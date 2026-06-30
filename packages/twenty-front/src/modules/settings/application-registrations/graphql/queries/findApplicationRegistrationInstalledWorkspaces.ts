import { gql } from '@apollo/client';

export const FIND_APPLICATION_REGISTRATION_INSTALLED_WORKSPACES = gql`
  query FindApplicationRegistrationInstalledWorkspaces(
    $id: String!
    $page: Int
  ) {
    findApplicationRegistrationInstalledWorkspaces(id: $id, page: $page) {
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
