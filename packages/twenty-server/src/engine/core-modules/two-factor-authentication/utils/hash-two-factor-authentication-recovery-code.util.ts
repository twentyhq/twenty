import { createHash } from 'crypto';

export const hashTwoFactorAuthenticationRecoveryCode = (
  recoveryCode: string,
): string =>
  createHash('sha256')
    .update(recoveryCode.toUpperCase().replace(/[^0-9A-Z]/g, ''))
    .digest('hex');
