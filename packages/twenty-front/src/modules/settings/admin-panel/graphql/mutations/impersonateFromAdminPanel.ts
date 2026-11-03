import { gql } from '@apollo/client';

export const IMPERSONATE_FROM_ADMIN_PANEL = gql`
  mutation ImpersonateFromAdminPanel($userId: UUID!, $workspaceId: UUID!) {
    impersonateFromAdminPanel(userId: $userId, workspaceId: $workspaceId) {
      workspace {
        id
        workspaceUrls {
          customUrl
          subdomainUrl
        }
      }
      loginToken {
        token
        expiresAt
      }
    }
  }
`;
