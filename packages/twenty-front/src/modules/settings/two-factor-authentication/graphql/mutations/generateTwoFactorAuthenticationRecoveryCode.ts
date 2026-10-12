import { gql } from '@apollo/client';

export const GENERATE_TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE = gql`
  mutation generateTwoFactorAuthenticationRecoveryCode(
    $userId: UUID!
    $otp: String
  ) {
    generateTwoFactorAuthenticationRecoveryCode(userId: $userId, otp: $otp) {
      recoveryCode
      expiresAt
    }
  }
`;
