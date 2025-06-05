import { gql } from '@apollo/client';

export const AVAILABLE_WORKSPACES_FOR_AUTH = gql`
  query ListAvailableWorkspaces {
    listAvailableWorkspaces {
      ...AvailableWorkspaceForAuthFragment
    }
  }
`;
