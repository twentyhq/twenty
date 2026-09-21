import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';

import { FeatureFlagKey } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { FeatureFlagEntity } from 'src/engine/core-modules/feature-flag/feature-flag.entity';
import { MetricsService } from 'src/engine/core-modules/metrics/metrics.service';

const ENABLED_WORKSPACES_METRIC_NAME = 'twenty_feature_flag_enabled_workspaces';

// The rollout gauge counts enabled workspaces across every tenant, so it needs
// the global repository rather than the workspace-scoped one (there is no
// workspace context during a metrics scrape).
@Injectable()
export class FeatureFlagGaugeService implements OnModuleInit {
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
        const enabledWorkspacesByFlag =
          await this.getEnabledWorkspaceCountsByFlag();

        // Emit a series for every known flag, defaulting to 0, so a flag with
        // no enabled workspaces reads as zero rollout rather than missing data.
        return Object.values(FeatureFlagKey).map((flagKey) => ({
          value: enabledWorkspacesByFlag.get(flagKey) ?? 0,
          attributes: { flag_key: flagKey },
        }));
      },
      cacheValue: true,
    });
  }

  private async getEnabledWorkspaceCountsByFlag(): Promise<
    Map<string, number>
  > {
    // Join workspace and filter deletedAt: the workspace relation cascades on
    // hard delete only, and featureFlag has no deletedAt, so a soft-deleted
    // workspace would otherwise keep counting toward the rollout forever.
    const rows = await this.dataSource
      .getRepository(FeatureFlagEntity)
      .createQueryBuilder('featureFlag')
      .select('featureFlag.key', 'flagKey')
      .addSelect('COUNT(*)', 'enabledWorkspaces')
      .innerJoin('featureFlag.workspace', 'workspace')
      .where('featureFlag.value = :value', { value: true })
      .andWhere('workspace.deletedAt IS NULL')
      .groupBy('featureFlag.key')
      .getRawMany<{ flagKey: string; enabledWorkspaces: string }>();

    return new Map(
      rows.map((row) => [row.flagKey, Number(row.enabledWorkspaces)]),
    );
  }
}
