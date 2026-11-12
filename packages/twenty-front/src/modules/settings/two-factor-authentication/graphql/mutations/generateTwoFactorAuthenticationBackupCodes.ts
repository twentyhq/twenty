import { gql } from '@apollo/client';

export const GENERATE_TWO_FACTOR_AUTHENTICATION_BACKUP_CODES = gql`
  mutation generateTwoFactorAuthenticationBackupCodes($otp: String) {
    generateTwoFactorAuthenticationBackupCodes(otp: $otp) {
      backupCodes
    }
  }
`;
