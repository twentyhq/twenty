import { gql } from '@apollo/client';

export const IMPERSONATE_WORKSPACE_USER_BY_MEMBER_ID = gql`
  mutation ImpersonateWorkspaceUserByWorkspaceMemberId(
    $targetWorkspaceMemberId: UUID!
  ) {
    impersonateWorkspaceUserByWorkspaceMemberId(
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
