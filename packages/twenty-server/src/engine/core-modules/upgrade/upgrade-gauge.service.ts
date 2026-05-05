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
const SNAPSHOT_TTL_MS = 60_000;

@Injectable()
export class UpgradeGaugeService implements OnModuleInit {
  private readonly logger = new Logger(UpgradeGaugeService.name);

  private cachedSnapshot: InstanceAndAllWorkspacesUpgradeStatus | null = null;
  private cachedSnapshotExpiresAt = 0;
  private inflightPromise: Promise<InstanceAndAllWorkspacesUpgradeStatus> | null =
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
        const snapshot = await this.getSnapshot();

        if (!snapshot) {
          return HEALTH_UNKNOWN;
        }

        return (
          HEALTH_TO_GAUGE_VALUE[snapshot.instanceUpgradeStatus.health] ??
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
        const snapshot = await this.getSnapshot();

        return snapshot?.workspacesBehind.length ?? 0;
      },
      cacheValue: true,
    });

    this.metricsService.createObservableGauge({
      metricName: 'twenty_upgrade_workspaces_failed_total',
      options: {
        description: 'Number of workspaces with a failed upgrade command',
      },
      callback: async () => {
        const snapshot = await this.getSnapshot();

        return snapshot?.workspacesFailed.length ?? 0;
      },
      cacheValue: true,
    });
  }

  // Deduplicates concurrent calls and memoizes for SNAPSHOT_TTL_MS
  // so all 3 gauges share a single fetch per scrape cycle.
  private async getSnapshot(): Promise<InstanceAndAllWorkspacesUpgradeStatus | null> {
    if (this.cachedSnapshot && Date.now() < this.cachedSnapshotExpiresAt) {
      return this.cachedSnapshot;
    }

    if (this.inflightPromise) {
      return this.inflightPromise;
    }

    this.inflightPromise =
      this.upgradeStatusService.getInstanceAndAllWorkspacesStatus();

    try {
      this.cachedSnapshot = await this.inflightPromise;
      this.cachedSnapshotExpiresAt = Date.now() + SNAPSHOT_TTL_MS;

      return this.cachedSnapshot;
    } catch (error) {
      this.logger.error('Failed to fetch upgrade status snapshot', error);

      return null;
    } finally {
      this.inflightPromise = null;
    }
  }
}
