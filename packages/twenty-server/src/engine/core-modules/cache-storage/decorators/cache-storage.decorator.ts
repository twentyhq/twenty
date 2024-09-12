import { Inject } from '@nestjs/common';

import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

export const InjectCacheStorage = (
  cacheStorageNamespace: CacheStorageNamespace,
) => {
  return Inject(cacheStorageNamespace);
};
