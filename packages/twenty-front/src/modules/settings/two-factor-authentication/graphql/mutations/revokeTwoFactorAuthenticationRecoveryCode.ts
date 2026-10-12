import { gql } from '@apollo/client';

export const REVOKE_TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE = gql`
  mutation revokeTwoFactorAuthenticationRecoveryCode($userId: UUID!) {
    revokeTwoFactorAuthenticationRecoveryCode(userId: $userId)
  }
`;
