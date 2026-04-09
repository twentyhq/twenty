import { Injectable, Logger } from '@nestjs/common';

import { logger } from '@sentry/node';
import { isDefined } from 'twenty-shared/utils';

import {
  TwentyORMException,
  TwentyORMExceptionCode,
} from 'src/engine/twenty-orm/exceptions/twenty-orm.exception';

type CacheResult<T, U> = {
  version: T;
  data: U;
};

@Injectable()
export class GetDataFromCacheWithRecomputeService<T, U> {
  private cache = new Map<string, CacheResult<T, U>>();

  logger = new Logger(GetDataFromCacheWithRecomputeService.name);
  constructor() {}

  getFromCacheWithRecompute = async ({
    workspaceId,
    getCacheData,
    getCacheVersion,
    recomputeCache,
    cachedEntityName,
    exceptionCode,
  }: {
    workspaceId: string;
    getCacheData: (workspaceId: string) => Promise<U | undefined>;
    getCacheVersion: (workspaceId: string) => Promise<T | undefined>;
    recomputeCache: (params: { workspaceId: string }) => Promise<void>;
    cachedEntityName: string;
    exceptionCode: TwentyORMExceptionCode;
  }): Promise<CacheResult<T, U>> => {
    let cachedVersion: T | undefined;
    let cachedData: U | undefined;

    cachedVersion = await getCacheVersion(workspaceId);

    if (isDefined(cachedVersion)) {
      const cacheKey = `${workspaceId}-${cachedVersion}`;
      const cachedValue = this.cache.get(cacheKey);

      if (cachedValue) {
        return cachedValue;
      }
    }

    cachedData = await getCacheData(workspaceId);

    if (!isDefined(cachedData) || !isDefined(cachedVersion)) {
      logger.warn(
        `Triggering cache recompute for ${cachedEntityName} (workspace ${workspaceId})`,
        {
          cachedVersion,
          cachedData,
        },
      );
      await recomputeCache({ workspaceId });

      cachedData = await getCacheData(workspaceId);
      cachedVersion = await getCacheVersion(workspaceId);

      if (!isDefined(cachedData) || !isDefined(cachedVersion)) {
        logger.warn(
          `Data still missing after recompute for ${cachedEntityName} (workspace ${workspaceId})`,
          {
            cachedVersion,
            cachedData,
          },
        );
        throw new TwentyORMException(
          `${cachedEntityName} not found after recompute for workspace ${workspaceId} (missingData: ${!isDefined(cachedData)}, missingVersion: ${!isDefined(cachedVersion)})`,
          exceptionCode,
        );
      }
    }

    const cacheKey = `${workspaceId}-${cachedVersion}`;

    this.cache.set(cacheKey, {
      version: cachedVersion,
      data: cachedData,
    });

    return {
      version: cachedVersion,
      data: cachedData,
    };
  };
}
