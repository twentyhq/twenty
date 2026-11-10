export const TWO_FACTOR_AUTHENTICATION_BACKUP_CODE_COUNT = 10;

// Backup codes never expire, but appToken.expiresAt is required
export const TWO_FACTOR_AUTHENTICATION_BACKUP_CODE_EXPIRES_AT = new Date(
  '9999-12-31T23:59:59.999Z',
);
