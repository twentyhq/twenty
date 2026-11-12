import { gql } from '@apollo/client';

export const TWO_FACTOR_AUTHENTICATION_BACKUP_CODE_STATUS = gql`
  query twoFactorAuthenticationBackupCodeStatus {
    twoFactorAuthenticationBackupCodeStatus {
      remainingBackupCodeCount
    }
  }
`;
