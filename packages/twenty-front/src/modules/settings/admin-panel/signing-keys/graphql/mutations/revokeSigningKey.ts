import { gql } from '@apollo/client';

export const REVOKE_SIGNING_KEY = gql`
  mutation RevokeSigningKey($id: UUID!) {
    revokeSigningKey(id: $id) {
      id
      isCurrent
      createdAt
      revokedAt
      verifyCountInWindow
    }
  }
`;
