import { gql } from '@apollo/client';

export const GENERATE_TWO_FACTOR_AUTHENTICATION_RECOVERY_CODE_AS_SERVER_ADMIN = gql`
  mutation GenerateTwoFactorAuthenticationRecoveryCodeAsServerAdmin(
    $userId: UUID!
    $workspaceId: UUID!
    $otp: String
  ) {
    generateTwoFactorAuthenticationRecoveryCodeAsServerAdmin(
      userId: $userId
      workspaceId: $workspaceId
      otp: $otp
    ) {
      recoveryCode
      expiresAt
    }
  }
`;
