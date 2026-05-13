import { isNonEmptyString } from '@sniptt/guards';

import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

export type ResolvedEncryptionKeys = {
  primary: string;
  fallback: string | null;
};

// Resolves the three env vars into a primary + optional fallback used by
// SecretEncryptionService. ENCRYPTION_KEY takes precedence; APP_SECRET is
// used as a back-compat fallback so existing deployments keep working
// without any configuration change.
export const resolveEncryptionKeys = (
  environmentConfigDriver: Pick<EnvironmentConfigDriver, 'get'>,
): ResolvedEncryptionKeys => {
  const encryptionKey = environmentConfigDriver.get('ENCRYPTION_KEY');
  const fallbackEncryptionKey = environmentConfigDriver.get(
    'FALLBACK_ENCRYPTION_KEY',
  );
  const appSecret = environmentConfigDriver.get('APP_SECRET');

  const primary = isNonEmptyString(encryptionKey) ? encryptionKey : appSecret;

  if (!isNonEmptyString(primary)) {
    throw new Error(
      'No encryption key configured: set ENCRYPTION_KEY (or APP_SECRET for legacy deployments).',
    );
  }

  const fallback = isNonEmptyString(fallbackEncryptionKey)
    ? fallbackEncryptionKey
    : null;

  return { primary, fallback };
};
