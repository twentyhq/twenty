import { Inject, Injectable, Logger } from '@nestjs/common';

import { ApplicationHealthStatus } from 'twenty-shared/application';

import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { CacheStorageService } from 'src/engine/core-modules/cache-storage/services/cache-storage.service';
import { CacheStorageNamespace } from 'src/engine/core-modules/cache-storage/types/cache-storage-namespace.enum';

const HEALTH_CHECK_RETENTION_MS = 24 * 60 * 60 * 1000;

type ApplicationHealthIdentity = Pick<
  ApplicationEntity,
  'id' | 'workspaceId' | 'version' | 'healthCheckLogicFunctionId'
>;

@Injectable()
export class ApplicationHealthCacheService {
  private readonly logger = new Logger(ApplicationHealthCacheService.name);

  constructor(
    @Inject(CacheStorageNamespace.ModuleApplications)
    private readonly cacheStorageService: CacheStorageService,
  ) {}

  async record(
    application: ApplicationHealthIdentity,
    status: ApplicationHealthStatus,
  ): Promise<void> {
    try {
      await this.cacheStorageService.set(
        this.getKey(application),
        status,
        HEALTH_CHECK_RETENTION_MS,
      );
    } catch (error) {
      this.logger.warn('Failed to cache application health check', error);
    }
  }

  async getStatuses(
    applications: ApplicationHealthIdentity[],
  ): Promise<(ApplicationHealthStatus | undefined)[]> {
    if (applications.length === 0) {
      return [];
    }

    try {
      return await this.cacheStorageService.mget<ApplicationHealthStatus>(
        applications.map((application) => this.getKey(application)),
      );
    } catch (error) {
      this.logger.warn('Failed to read application health checks', error);

      return applications.map(() => undefined);
    }
  }

  private getKey(application: ApplicationHealthIdentity): string {
    return `health-check:${application.workspaceId}:${application.id}:${application.version}:${application.healthCheckLogicFunctionId}`;
  }
}
