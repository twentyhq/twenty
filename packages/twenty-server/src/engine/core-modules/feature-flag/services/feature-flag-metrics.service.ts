import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { DataSource } from 'typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

const ENABLED_WORKSPACES_METRIC_NAME = 'twenty_feature_flag_enabled_workspaces';

@Injectable()
export class FeatureFlagMetricsService implements OnModuleInit {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    private readonly metricsService: MetricsService,
  ) {}

  onModuleInit() {
    this.metricsService.createMultiObservableGauge({
      metricName: ENABLED_WORKSPACES_METRIC_NAME,
      options: {
        description:
          'Number of workspaces with a given feature flag enabled, labelled by flag_key. Tracks the progress of a feature flag rollout.',
      },
      callback: async () => {
        const rows = await this.getEnabledWorkspaceCountsByFlag();

        return rows.map(({ flagKey, enabledWorkspaces }) => ({
          value: enabledWorkspaces,
          attributes: { flag_key: flagKey },
        }));
      },
      cacheValue: true,
    });
  }

  private async getEnabledWorkspaceCountsByFlag(): Promise<
    Array<{ flagKey: string; enabledWorkspaces: number }>
  > {
    const rows = await this.dataSource
      .getRepository(FeatureFlagEntity)
      .createQueryBuilder('featureFlag')
      .select('featureFlag.key', 'flagKey')
      .addSelect('COUNT(*)', 'enabledWorkspaces')
      .where('featureFlag.value = :value', { value: true })
      .groupBy('featureFlag.key')
      .getRawMany<{ flagKey: string; enabledWorkspaces: string }>();

    return rows.map((row) => ({
      flagKey: row.flagKey,
      enabledWorkspaces: Number(row.enabledWorkspaces),
    }));
  }
}
