export const SECRET_ENCRYPTION_ROTATION_SITE_NAME = {
  CONNECTED_ACCOUNT_TOKENS: 'connected-account-tokens',
  APPLICATION_VARIABLE: 'application-variable',
  APPLICATION_REGISTRATION_VARIABLE: 'application-registration-variable',
  SIGNING_KEY_PRIVATE_KEYS: 'signing-key-private-keys',
  SENSITIVE_CONFIG_STORAGE: 'sensitive-config-storage',
  TOTP_SECRETS: 'totp-secrets',
} as const;

export type SecretEncryptionRotationSiteName =
  (typeof SECRET_ENCRYPTION_ROTATION_SITE_NAME)[keyof typeof SECRET_ENCRYPTION_ROTATION_SITE_NAME];
