import { gql } from '@apollo/client';

export const ADMIN_PANEL_RECENT_USERS = gql`
  query AdminPanelRecentUsers($searchTerm: String) {
    adminPanelRecentUsers(searchTerm: $searchTerm) {
      id
      email
      firstName
      lastName
      createdAt
      workspaceName
      workspaceId
    }
  }
`;
