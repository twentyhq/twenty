import { gql } from '@apollo/client';

export const REVOKE_ALL_OTHER_USER_SESSIONS = gql`
  mutation RevokeAllOtherUserSessions {
    revokeAllOtherUserSessions
  }
`;
