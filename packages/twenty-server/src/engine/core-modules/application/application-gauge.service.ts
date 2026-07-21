import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

const TOP_INSTALLED_APPS_LIMIT = 100;

@Injectable()
export class ApplicationGaugeService implements OnModuleInit {
  private readonly logger = new Logger(ApplicationGaugeService.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly applicationService: ApplicationService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: 'twenty_app_installed_workspaces_total',
      options: {
        description:
          'Number of workspaces each application is installed in (top 100 external apps by install count)',
      },
      callback: async () => {
        try {
          const installedApps =
            await this.applicationService.countInstalledWorkspacesByApplication(
              {
                limit: TOP_INSTALLED_APPS_LIMIT,
              },
            );

          return installedApps.map((installedApp) => ({
            value: installedApp.installedWorkspaceCount,
            attributes: {
              universal_identifier: installedApp.universalIdentifier,
              app_name: installedApp.name,
              source_type: installedApp.sourceType,
            },
          }));
        } catch (error) {
          this.logger.error(
            'Failed to collect installed application counts for gauge',
            error,
          );

          return [];
        }
      },
      cacheValue: true,
    });
  }
}
