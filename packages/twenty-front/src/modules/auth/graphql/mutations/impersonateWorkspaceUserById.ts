import { gql } from '@apollo/client';

export const IMPERSONATE_WORKSPACE_USER_BY_ID = gql`
  mutation ImpersonateWorkspaceUserById($targetWorkspaceMemberId: UUID!) {
    ImpersonateWorkspaceUserById(
      targetWorkspaceMemberId: $targetWorkspaceMemberId
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
