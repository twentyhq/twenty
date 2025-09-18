import { gql } from '@apollo/client';

export const IMPERSONATE_WORKSPACE_USER_BY_ID = gql`
  mutation ImpersonateWorkspaceUserById($targetUserId: UUID!) {
    ImpersonateWorkspaceUserById(
      targetUserId: $targetUserId
    ) {
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
