import { gql } from '@apollo/client';

export const TWO_FACTOR_AUTHENTICATION_RECOVERY_STATUS = gql`
  query twoFactorAuthenticationRecoveryStatus($userId: UUID!) {
    twoFactorAuthenticationRecoveryStatus(userId: $userId) {
      hasVerifiedTwoFactorAuthenticationMethod
      pendingRecoveryCodeExpiresAt
    }
  }
`;
