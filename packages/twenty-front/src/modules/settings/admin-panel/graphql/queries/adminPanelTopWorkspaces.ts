import { gql } from '@apollo/client';

export const ADMIN_PANEL_TOP_WORKSPACES = gql`
  query AdminPanelTopWorkspaces($searchTerm: String) {
    adminPanelTopWorkspaces(searchTerm: $searchTerm) {
      id
      logoUrl
      name
      totalUsers
      subdomain
    }
  }
`;
