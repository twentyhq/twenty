import { gql } from '@apollo/client';

export const IMPERSONATE_WORKSPACE_USER = gql`
  mutation ImpersonateWorkspaceUser($targetUserWorkspaceId: UUID!) {
    impersonateWorkspaceUser(targetUserWorkspaceId: $targetUserWorkspaceId) {
      tokens {
        accessOrWorkspaceAgnosticToken {
          token
          expiresAt
        }
        refreshToken {
          token
          expiresAt
        }
      }
    }
  }
`;
