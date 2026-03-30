import { Injectable } from '@nestjs/common';

import {
  type CoreEntityCacheDataMap,
  type CoreEntityCacheKeyName,
} from 'src/engine/core-entity-cache/types/core-entity-cache-key.type';

type CoreEntityCacheDataType = CoreEntityCacheDataMap[CoreEntityCacheKeyName];

@Injectable()
export abstract class CoreEntityCacheProvider<
  T extends CoreEntityCacheDataType = CoreEntityCacheDataType,
> {
  abstract computeForCache(entityId: string): Promise<T | null>;
}
