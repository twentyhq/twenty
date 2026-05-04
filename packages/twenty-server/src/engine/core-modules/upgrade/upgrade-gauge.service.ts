import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { UpgradeHealthEnum } from 'twenty-shared/types';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import { UpgradeStatusService } from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

const HEALTH_TO_GAUGE_VALUE: Record<UpgradeHealthEnum, number> = {
  [UpgradeHealthEnum.UP_TO_DATE]: 1,
  [UpgradeHealthEnum.BEHIND]: 0,
  [UpgradeHealthEnum.FAILED]: -1,
};

@Injectable()
export class UpgradeGaugeService implements OnModuleInit {
  private readonly logger = new Logger(UpgradeGaugeService.name);

  constructor(
    private readonly metricsService: MetricsService,
    private readonly upgradeStatusService: UpgradeStatusService,
  ) {}

  onModuleInit() {
    this.metricsService.createObservableGauge({
      metricName: 'twenty_upgrade_instance_health',
      options: {
        description:
          'Instance upgrade health (1 = up-to-date, 0 = behind, -1 = failed)',
      },
      callback: async () => {
        return this.getInstanceHealthGauge();
      },
      cacheValue: true,
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_upgrade_workspaces_behind_total',
      options: {
        description: 'Number of workspaces behind on upgrade commands',
      },
      callback: async () => {
        return this.getWorkspacesBehindCount();
      },
      cacheValue: true,
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_upgrade_workspaces_failed_total',
      options: {
        description: 'Number of workspaces with a failed upgrade command',
      },
      callback: async () => {
        return this.getWorkspacesFailedCount();
      },
      cacheValue: true,
    });
  }

  private async getInstanceHealthGauge(): Promise<number> {
    try {
      const status =
        await this.upgradeStatusService.getInstanceAndAllWorkspacesStatus();

      return HEALTH_TO_GAUGE_VALUE[status.instanceUpgradeStatus.health] ?? 0;
    } catch (error) {
      this.logger.error('Failed to get instance upgrade health', error);

      return 0;
    }
  }

  private async getWorkspacesBehindCount(): Promise<number> {
    try {
      const status =
        await this.upgradeStatusService.getInstanceAndAllWorkspacesStatus();

      return status.workspacesBehind.length;
    } catch (error) {
      this.logger.error('Failed to count workspaces behind', error);

      return 0;
    }
  }

  private async getWorkspacesFailedCount(): Promise<number> {
    try {
      const status =
        await this.upgradeStatusService.getInstanceAndAllWorkspacesStatus();

      return status.workspacesFailed.length;
    } catch (error) {
      this.logger.error('Failed to count workspaces failed', error);

      return 0;
    }
  }
}
