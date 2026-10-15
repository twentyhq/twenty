import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { APPLICATION_LIFECYCLE_LOCK_OPTIONS } from 'src/engine/core-modules/application/application-install/constants/application-lifecycle-lock-options.constant';
import { APPLICATION_UNINSTALL_STEPS } from 'src/engine/core-modules/application/application-install/constants/application-uninstall-steps.constant';
import { buildApplicationLifecycleLockKey } from 'src/engine/core-modules/application/application-install/utils/build-application-lifecycle-lock-key.util';
import { createApplicationLifecycleProgressReporter } from 'src/engine/core-modules/application/application-install/utils/create-application-lifecycle-progress-reporter.util';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { type MessageQueueJobProgressContext } from 'src/engine/core-modules/message-queue/interfaces/message-queue-job.interface';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

@Injectable()
export class ApplicationUninstallRunnerService {
  constructor(
    private readonly applicationLookupService: ApplicationLookupService,
    private readonly applicationService: ApplicationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly metricsService: MetricsService,
    private readonly cacheLockService: CacheLockService,
  ) {}

  async uninstallApplication({
    universalIdentifier,
    workspaceId,
    updateProgress,
  }: {
    universalIdentifier: string;
    workspaceId: string;
    updateProgress?: MessageQueueJobProgressContext['updateProgress'];
  }): Promise<void> {
    let application: ApplicationEntity | null = null;

    const progressReporter = createApplicationLifecycleProgressReporter({
      steps: APPLICATION_UNINSTALL_STEPS,
      updateProgress,
    });

    try {
      application =
        await this.applicationLookupService.findByUniversalIdentifier({
          universalIdentifier,
          workspaceId,
        });

      if (isDefined(application)) {
        await this.applicationService.assertUninstallIsNotBlockedByOtherWorkspaceInstallationsOrThrow(
          { application, workspaceId },
        );
      }

      await this.cacheLockService.withLock(
        () =>
          this.applicationSyncService.uninstallApplication({
            applicationUniversalIdentifier: universalIdentifier,
            workspaceId,
            progressReporter,
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
