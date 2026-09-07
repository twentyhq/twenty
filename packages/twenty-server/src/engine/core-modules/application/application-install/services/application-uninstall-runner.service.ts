import { Injectable } from '@nestjs/common';

import { ApplicationSyncService } from 'src/engine/core-modules/application/application-manifest/application-sync.service';
import { ApplicationException } from 'src/engine/core-modules/application/application.exception';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { MetricsKeys } from 'src/engine/core-modules/metrics/types/metrics-keys.type';

@Injectable()
export class ApplicationUninstallRunnerService {
  constructor(
    private readonly applicationService: ApplicationService,
    private readonly applicationSyncService: ApplicationSyncService,
    private readonly metricsService: MetricsService,
  ) {}

  async uninstallApplication({
    universalIdentifier,
    workspaceId,
  }: {
    universalIdentifier: string;
    workspaceId: string;
  }): Promise<void> {
    const application = await this.applicationService.findByUniversalIdentifier(
      {
        universalIdentifier,
        workspaceId,
      },
    );

    const attributes = {
      universal_identifier: universalIdentifier,
      app_name: application?.name ?? 'unknown',
      source_type: application?.sourceType ?? 'unknown',
      version: application?.version ?? 'unknown',
    };

    try {
      await this.applicationSyncService.uninstallApplication({
        applicationUniversalIdentifier: universalIdentifier,
        workspaceId,
      });
    } catch (error) {
      this.metricsService.incrementCounterBy({
        key: MetricsKeys.AppUninstallFailed,
        amount: 1,
        attributes: {
          ...attributes,
          error_code:
            error instanceof ApplicationException ? error.code : 'UNKNOWN',
        },
      });

      throw error;
    }

    this.metricsService.incrementCounterBy({
      key: MetricsKeys.AppUninstallSucceeded,
      amount: 1,
      attributes,
    });
  }
}
