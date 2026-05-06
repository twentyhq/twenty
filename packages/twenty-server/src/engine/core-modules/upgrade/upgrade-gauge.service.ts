import { Injectable, Logger, OnModuleInit } from '@nestjs/common';

import { UpgradeHealthEnum } from 'twenty-shared/types';

import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';
import {
  type InstanceAndAllWorkspacesUpgradeStatus,
  UpgradeStatusService,
} from 'src/engine/core-modules/upgrade/services/upgrade-status.service';

const HEALTH_TO_GAUGE_VALUE: Record<UpgradeHealthEnum, number> = {
  [UpgradeHealthEnum.UP_TO_DATE]: 1,
  [UpgradeHealthEnum.BEHIND]: 0,
  [UpgradeHealthEnum.FAILED]: -1,
};

const HEALTH_UNKNOWN = -2;
const UPGRADE_STATUS_TTL_MS = 60_000;

@Injectable()
export class UpgradeGaugeService implements OnModuleInit {
  private readonly logger = new Logger(UpgradeGaugeService.name);

  private cachedUpgradeStatus: InstanceAndAllWorkspacesUpgradeStatus | null =
    null;
  private cachedUpgradeStatusExpiresAt = 0;
  private inflightUpgradeStatusPromise: Promise<InstanceAndAllWorkspacesUpgradeStatus> | null =
    null;

  constructor(
    private readonly metricsService: MetricsService,
    private readonly upgradeStatusService: UpgradeStatusService,
  ) {}

  onModuleInit() {
    this.metricsService.createObservableGauge({
      metricName: 'twenty_upgrade_instance_health',
      options: {
        description:
          'Instance upgrade health (1 = up-to-date, 0 = behind, -1 = failed, -2 = unknown)',
      },
      callback: async () => {
        const upgradeStatus = await this.getCachedUpgradeStatus();

        if (!upgradeStatus) {
          return HEALTH_UNKNOWN;
        }

        return (
          HEALTH_TO_GAUGE_VALUE[upgradeStatus.instanceUpgradeStatus.health] ??
          HEALTH_UNKNOWN
        );
      },
      cacheValue: true,
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_upgrade_workspaces_behind_total',
      options: {
        description: 'Number of workspaces behind on upgrade commands',
      },
      callback: async () => {
        const upgradeStatus = await this.getCachedUpgradeStatus();

        return upgradeStatus?.workspacesBehind.length ?? 0;
      },
      cacheValue: true,
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_upgrade_workspaces_failed_total',
      options: {
        description: 'Number of workspaces with a failed upgrade command',
      },
      callback: async () => {
        const upgradeStatus = await this.getCachedUpgradeStatus();

        return upgradeStatus?.workspacesFailed.length ?? 0;
      },
      cacheValue: true,
    });
  }

  private async getCachedUpgradeStatus(): Promise<InstanceAndAllWorkspacesUpgradeStatus | null> {
    if (
      this.cachedUpgradeStatus &&
      Date.now() < this.cachedUpgradeStatusExpiresAt
    ) {
      return this.cachedUpgradeStatus;
    }

    if (this.inflightUpgradeStatusPromise) {
      return this.inflightUpgradeStatusPromise.catch(() => null);
    }

    this.inflightUpgradeStatusPromise =
      this.upgradeStatusService.getInstanceAndAllWorkspacesStatus();

    try {
      this.cachedUpgradeStatus = await this.inflightUpgradeStatusPromise;
      this.cachedUpgradeStatusExpiresAt = Date.now() + UPGRADE_STATUS_TTL_MS;

      return this.cachedUpgradeStatus;
    } catch (error) {
      this.logger.error('Failed to fetch upgrade status for gauges', error);

      return null;
    } finally {
      this.inflightUpgradeStatusPromise = null;
    }
  }
}
