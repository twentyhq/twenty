import { createHash } from 'crypto';

// Codes are compared case-insensitively and without separators, so the same
// normalization runs before hashing on issue and on redemption.
export const hashTwoFactorAuthenticationRecoveryCode = (
  recoveryCode: string,
): string =>
  createHash('sha256')
    .update(recoveryCode.toUpperCase().replace(/[^0-9A-Z]/g, ''))
    .digest('hex');
