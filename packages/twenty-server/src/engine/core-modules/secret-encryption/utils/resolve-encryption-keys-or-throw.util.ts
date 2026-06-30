import { isNonEmptyString } from '@sniptt/guards';

import {
  SecretEncryptionException,
  SecretEncryptionExceptionCode,
} from 'src/engine/core-modules/secret-encryption/exceptions/secret-encryption.exception';
import { type ResolvedEncryptionKeys } from 'src/engine/core-modules/secret-encryption/types/resolved-encryption-keys.type';
import { type EnvironmentConfigDriver } from 'src/engine/core-modules/twenty-config/drivers/environment-config.driver';

export const resolveEncryptionKeysOrThrow = ({
  environmentConfigDriver,
}: {
  environmentConfigDriver: Pick<EnvironmentConfigDriver, 'get'>;
}): ResolvedEncryptionKeys => {
  const encryptionKey = environmentConfigDriver.get('ENCRYPTION_KEY');
  const fallbackEncryptionKey = environmentConfigDriver.get(
    'FALLBACK_ENCRYPTION_KEY',
  );
  const appSecret = environmentConfigDriver.get('APP_SECRET');

  const primary = isNonEmptyString(encryptionKey) ? encryptionKey : appSecret;

  if (!isNonEmptyString(primary)) {
    throw new SecretEncryptionException(
      'No encryption key configured: set ENCRYPTION_KEY (or APP_SECRET for legacy deployments).',
      SecretEncryptionExceptionCode.NO_ENCRYPTION_KEY_CONFIGURED,
    );
  }

  const fallback = isNonEmptyString(fallbackEncryptionKey)
    ? fallbackEncryptionKey
    : null;

  return { primary, fallback };
};
