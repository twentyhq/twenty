import { Inject, Injectable, Logger } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ClickHouseService } from 'src/database/clickhouse/clickhouse.service';
import { ApplicationRegistrationStatsService } from 'src/engine/core-modules/application/application-registration/application-registration-stats.service';
import { type ApplicationRegistrationStatsDTO } from 'src/engine/core-modules/application/application-registration/dtos/application-registration-stats.dto';
import { type ApplicationRegistrationStatsInput } from 'src/engine/core-modules/application/application-registration/types/application-registration-stats-input.type';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { CacheLockException } from 'src/engine/core-modules/cache-lock/exceptions/cache-lock.exception';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const STATS_CACHE_TTL_MS = 10 * 60 * 1000;
const UNAVAILABLE_CREDITS_CACHE_TTL_MS = 30 * 1000;

@Injectable()
export class ApplicationRegistrationStatsCacheService {
  private readonly logger = new Logger(
    ApplicationRegistrationStatsCacheService.name,
  );

  constructor(
    private readonly applicationRegistrationStatsService: ApplicationRegistrationStatsService,
    private readonly clickHouseService: ClickHouseService,
    @Inject(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async computeStats(
    registration: ApplicationRegistrationStatsInput,
  ): Promise<ApplicationRegistrationStatsDTO> {
    const cacheKey = `registration-stats:v2:${registration.id}:${registration.latestAvailableVersion ?? 'unknown'}`;
    let isComputing = false;

    try {
      const cached =
        await this.cacheStorageService.get<ApplicationRegistrationStatsDTO>(
          cacheKey,
        );

      if (isDefined(cached)) {
        return cached;
      }

      return await this.cacheLockService.withLock(
        async () => {
          const cached =
            await this.cacheStorageService.get<ApplicationRegistrationStatsDTO>(
              cacheKey,
            );

          if (isDefined(cached)) {
            return cached;
          }

          isComputing = true;
          const stats =
            await this.applicationRegistrationStatsService.computeStats(
              registration,
            );
          const ttl =
            stats.totalCreditsConsumed === null &&
            isDefined(this.clickHouseService.getMainClient())
              ? UNAVAILABLE_CREDITS_CACHE_TTL_MS
              : STATS_CACHE_TTL_MS;

          try {
            await this.cacheStorageService.set(cacheKey, stats, ttl);
          } catch (error) {
            this.logger.warn(
              'Failed to cache application registration stats',
              error,
            );
          }

          return stats;
        },
        cacheKey,
        { maxRetries: 600 },
      );
    } catch (error) {
      if (isComputing || error instanceof CacheLockException) {
        throw error;
      }

      this.logger.warn(
        'Failed to read application registration stats cache',
        error,
      );

      return this.applicationRegistrationStatsService.computeStats(
        registration,
      );
    }
  }
}
