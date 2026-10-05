import { gql } from '@apollo/client';

export const REVOKE_USER_SESSION = gql`
  mutation RevokeUserSession($userSessionId: UUID!) {
    revokeUserSession(userSessionId: $userSessionId)
  }
`;
