export const SECRET_ENCRYPTION_ROTATION_SITE_NAME = {
  CONNECTED_ACCOUNT_ACCESS_TOKEN: 'connected-account-access-token',
  CONNECTED_ACCOUNT_REFRESH_TOKEN: 'connected-account-refresh-token',
  CONNECTED_ACCOUNT_CONNECTION_PARAMETERS:
    'connected-account-connection-parameters',
  APPLICATION_VARIABLE: 'application-variable',
  APPLICATION_REGISTRATION_VARIABLE: 'application-registration-variable',
  SIGNING_KEY_PRIVATE_KEY: 'signing-key-private-key',
  SENSITIVE_CONFIG_STORAGE: 'sensitive-config-storage',
  TOTP_SECRET: 'totp-secret',
} as const;

export type SecretEncryptionRotationSiteName =
  (typeof SECRET_ENCRYPTION_ROTATION_SITE_NAME)[keyof typeof SECRET_ENCRYPTION_ROTATION_SITE_NAME];
