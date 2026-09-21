import { Injectable } from '@nestjs/common';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { APPLICATION_LIFECYCLE_LOCK_OPTIONS } from 'src/engine/core-modules/application/application-install/constants/application-lifecycle-lock-options.constant';
import { buildApplicationLifecycleLockKey } from 'src/engine/core-modules/application/application-install/utils/build-application-lifecycle-lock-key.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

@Injectable()
export class ApplicationUninstallRunnerService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly metricsService: MetricsService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async uninstallApplication({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<void> {
    let application: ApplicationEntity | null = null;

    try {
      application = await this.applicationService.findByUniversalIdentifier({
        universalIdentifier,
        workspaceId,
      });

      await this.cacheLockService.withLock(
        () =>
          this.applicationSyncService.uninstallApplication({
            applicationUniversalIdentifier: universalIdentifier,
            workspaceId,
          }),
        buildApplicationLifecycleLockKey({ workspaceId, universalIdentifier }),
        APPLICATION_LIFECYCLE_LOCK_OPTIONS,
      );
    } catch (error) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AppUninstallFailed,
        amount: 1,
        attributes: {
          ...this.buildMetricsAttributes({ universalIdentifier, application }),
          error_code:
            error instanceof ApplicationException ? error.code : 'UNKNOWN',
        },
      });

      throw error;
    }

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AppUninstallSucceeded,
      amount: 1,
      attributes: this.buildMetricsAttributes({
        universalIdentifier,
        application,
      }),
    });
  }

  private buildMetricsAttributes({
    universalIdentifier,
    application,
  }: {
    universalIdentifier: string;
    application: ApplicationEntity | null;
  }) {
    return {
      universal_identifier: universalIdentifier,
      app_name: application?.name ?? 'unknown',
      source_type: application?.sourceType ?? 'unknown',
      version: application?.version ?? 'unknown',
    };
  }
}
