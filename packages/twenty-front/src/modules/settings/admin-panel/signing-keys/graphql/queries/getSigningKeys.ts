import { gql } from '@apollo/client';

export const GET_SIGNING_KEYS = gql`
  query GetSigningKeys {
    getSigningKeys {
      signingKeys {
        id
        publicKey
        isCurrent
        createdAt
        revokedAt
        verifyCountInWindow
      }
      legacyVerifyCountInWindow
      verifyWindowDays
    }
  }
`;
