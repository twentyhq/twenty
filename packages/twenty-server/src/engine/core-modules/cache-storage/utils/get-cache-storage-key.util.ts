import { isNonEmptyString } from '@sniptt/guards';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

export const getCacheStorageKey = ({
  key,
  namespace,
  keyPrefix = '',
  isTestEnvironment = false,
}: {
  key: string;
  namespace: CacheStorageNamespace;
  keyPrefix?: string;
  isTestEnvironment?: boolean;
}): string => {
  const formattedPrefix = isNonEmptyString(keyPrefix) ? `${keyPrefix}:` : '';
  const formattedKey = `${formattedPrefix}${namespace}:${key}`;

  return isTestEnvironment
    ? `${CacheStorageNamespace.IntegrationTests}:${formattedKey}`
    : formattedKey;
};
