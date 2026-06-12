import { gql } from '@apollo/client';

export const ADMIN_PANEL_RECENT_USERS = gql`
  query AdminPanelRecentUsers($searchTerm: String) {
    adminPanelRecentUsers(searchTerm: $searchTerm) {
      id
      email
      firstName
      lastName
      avatarUrl
      createdAt
      workspaceName
      workspaceId
      workspaceLogo
    }
  }
`;
