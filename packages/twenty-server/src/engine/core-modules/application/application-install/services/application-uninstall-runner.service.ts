import { Injectable } from '@nestjs/common';

import { isDefined } from 'twenty-shared/utils';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationLookupService } from 'src/engine/core-modules/application/application-lookup/application-lookup.service';
import { type ApplicationEntity } from 'src/engine/core-modules/application/application.entity';
import { ApplicationExceptionCode } from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { APPLICATION_LIFECYCLE_LOCK_OPTIONS } from 'src/engine/core-modules/application/application-install/constants/application-lifecycle-lock-options.constant';
import { APPLICATION_UNINSTALL_STEPS } from 'src/engine/core-modules/application/application-install/constants/application-uninstall-steps.constant';
import { buildApplicationLifecycleLockKey } from 'src/engine/core-modules/application/application-install/utils/build-application-lifecycle-lock-key.util';
import { buildApplicationLifecycleLogEntry } from 'src/engine/core-modules/application/application-install/utils/build-application-lifecycle-log-entry.util';
import { createApplicationLifecycleProgressReporter } from 'src/engine/core-modules/application/application-install/utils/create-application-lifecycle-progress-reporter.util';
import { getApplicationErrorCode } from 'src/engine/core-modules/application/application-install/utils/get-application-error-code.util';
import { WellKnownOAuthClientInstallService } from 'src/engine/core-modules/application/well-known-oauth-client/services/well-known-oauth-client-install.service';
import { CacheLockService } from 'src/engine/core-modules/cache-lock/cache-lock.service';
import { EventLogEmitterService } from 'src/engine/core-modules/event-logs/emit/event-log-emitter.service';
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
    private readonly eventLogEmitterService: EventLogEmitterService,
    private readonly wellKnownOAuthClientInstallService: WellKnownOAuthClientInstallService,
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
    // The installs folded into the target's row go first, so a failure leaves the target to retry
    const foldedInstallUniversalIdentifiers =
      await this.wellKnownOAuthClientInstallService.findFoldedInstallUniversalIdentifiers(
        { workspaceId, universalIdentifier },
      );

    for (const foldedInstallUniversalIdentifier of foldedInstallUniversalIdentifiers) {
      await this.uninstallOneApplication({
        universalIdentifier: foldedInstallUniversalIdentifier,
        workspaceId,
        shouldSkipIfNotInstalled: true,
      });
    }

    await this.uninstallOneApplication({
      universalIdentifier,
      workspaceId,
      updateProgress,
    });
  }

  private async uninstallOneApplication({
    universalIdentifier,
    workspaceId,
    updateProgress,
    shouldSkipIfNotInstalled = false,
  }: {
    universalIdentifier: string;
    workspaceId: string;
    updateProgress?: MessageQueueJobProgressContext['updateProgress'];
    shouldSkipIfNotInstalled?: boolean;
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
      // Matched on the read under the lock, so it also skips one a concurrent run was still uninstalling
      if (
        shouldSkipIfNotInstalled &&
        getApplicationErrorCode(error) ===
          ApplicationExceptionCode.APPLICATION_NOT_FOUND
      ) {
        return;
      }

      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AppUninstallFailed,
        amount: 1,
        attributes: {
          ...this.buildMetricsAttributes({ universalIdentifier, application }),
          error_code: getApplicationErrorCode(error),
        },
      });

      await this.recordUninstallLog({ application, workspaceId, error });

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

    await this.recordUninstallLog({ application, workspaceId });
  }

  private async recordUninstallLog({
    application,
    workspaceId,
    error,
  }: {
    application: ApplicationEntity | null;
    workspaceId: string;
    error?: unknown;
  }) {
    if (!isDefined(application)) {
      return;
    }

    await this.eventLogEmitterService.recordApplicationPlatformEvents([
      buildApplicationLifecycleLogEntry({
        source: 'UNINSTALL',
        workspaceId,
        applicationId: application.id,
        applicationRegistrationId: application.applicationRegistrationId ?? '',
        version: application.version ?? '',
        error,
      }),
    ]);
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
