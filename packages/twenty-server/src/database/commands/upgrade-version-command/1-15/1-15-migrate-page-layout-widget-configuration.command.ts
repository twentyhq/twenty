import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { PageLayoutWidgetEntity } from 'src/engine/metadata-modules/page-layout-widget/entities/page-layout-widget.entity';
import { BarChartLayout } from 'src/engine/metadata-modules/page-layout-widget/enums/bar-chart-layout.enum';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { WidgetType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-type.enum';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

enum DeprecatedGraphType {
  VERTICAL_BAR = 'VERTICAL_BAR',
  HORIZONTAL_BAR = 'HORIZONTAL_BAR',
  PIE = 'PIE',
  LINE = 'LINE',
  AGGREGATE = 'AGGREGATE',
  GAUGE = 'GAUGE',
}

const migrateConfiguration = (
  widgetType: WidgetType,
  configuration: Record<string, unknown>,
): Record<string, unknown> => {
  const existingConfigurationType = configuration.configurationType as
    | string
    | undefined;

  if (isDefined(existingConfigurationType)) {
    return configuration;
  }

  switch (widgetType) {
    case WidgetType.GRAPH:
      return migrateGraphConfiguration(configuration);
    case WidgetType.IFRAME:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.IFRAME,
      };
    case WidgetType.STANDALONE_RICH_TEXT:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.STANDALONE_RICH_TEXT,
      };
    case WidgetType.VIEW:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.VIEW,
      };
    case WidgetType.FIELDS:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.FIELDS,
      };
    case WidgetType.TIMELINE:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.TIMELINE,
      };
    case WidgetType.TASKS:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.TASKS,
      };
    case WidgetType.NOTES:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.NOTES,
      };
    case WidgetType.FILES:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.FILES,
      };
    case WidgetType.EMAILS:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.EMAILS,
      };
    case WidgetType.CALENDAR:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.CALENDAR,
      };
    case WidgetType.FIELD_RICH_TEXT:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.FIELD_RICH_TEXT,
      };
    case WidgetType.WORKFLOW:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.WORKFLOW,
      };
    case WidgetType.WORKFLOW_VERSION:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.WORKFLOW_VERSION,
      };
    case WidgetType.WORKFLOW_RUN:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.WORKFLOW_RUN,
      };
    case WidgetType.FIELD:
      return {
        ...configuration,
        configurationType: WidgetConfigurationType.FIELD,
      };
    default:
      assertUnreachable(widgetType);
  }
};

const migrateGraphConfiguration = (
  configuration: Record<string, unknown>,
): Record<string, unknown> => {
  const { graphType: _, ...restConfig } = configuration;
  const graphType = configuration.graphType as DeprecatedGraphType | undefined;

  if (!isDefined(graphType)) {
    return configuration;
  }

  switch (graphType) {
    case DeprecatedGraphType.VERTICAL_BAR:
      return {
        ...restConfig,
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.VERTICAL,
      };
    case DeprecatedGraphType.HORIZONTAL_BAR:
      return {
        ...restConfig,
        configurationType: WidgetConfigurationType.BAR_CHART,
        layout: BarChartLayout.HORIZONTAL,
      };
    case DeprecatedGraphType.PIE:
      return {
        ...restConfig,
        configurationType: WidgetConfigurationType.PIE_CHART,
      };
    case DeprecatedGraphType.LINE:
      return {
        ...restConfig,
        configurationType: WidgetConfigurationType.LINE_CHART,
      };
    case DeprecatedGraphType.AGGREGATE:
      return {
        ...restConfig,
        configurationType: WidgetConfigurationType.AGGREGATE_CHART,
      };
    case DeprecatedGraphType.GAUGE:
      return {
        ...restConfig,
        configurationType: WidgetConfigurationType.GAUGE_CHART,
      };
    default:
      assertUnreachable(graphType);
  }
};

const needsMigration = (
  widgetType: WidgetType,
  configuration: Record<string, unknown>,
): boolean => {
  const graphType = configuration.graphType as DeprecatedGraphType | undefined;
  const configurationType = configuration.configurationType as
    | WidgetConfigurationType
    | undefined;

  if (isDefined(graphType)) {
    return true;
  }

  if (
    !isDefined(configurationType) &&
    (widgetType === WidgetType.IFRAME ||
      widgetType === WidgetType.STANDALONE_RICH_TEXT)
  ) {
    return true;
  }

  return false;
};

@Command({
  name: 'upgrade:1-15:migrate-page-layout-widget-configuration',
  description:
    'Migrate page layout widget configurations to use configurationType',
})
export class MigratePageLayoutWidgetConfigurationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    @InjectRepository(PageLayoutWidgetEntity)
    private readonly pageLayoutWidgetRepository: Repository<PageLayoutWidgetEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting migration of page layout widget configurations for workspace ${workspaceId}`,
    );

    const widgets = await this.pageLayoutWidgetRepository.find({
      where: { workspaceId },
      select: ['id', 'type', 'configuration'],
    });

    const widgetsWithNullConfiguration = widgets.filter(
      (widget) => !isDefined(widget.configuration),
    );

    for (const widget of widgetsWithNullConfiguration) {
      this.logger.log(
        `Widget ${widget.id} has a corrupted configuration (null). Skipping migration.`,
      );
    }

    const widgetsToMigrate = widgets.filter(
      (widget) =>
        isDefined(widget.configuration) &&
        needsMigration(
          widget.type,
          widget.configuration as unknown as Record<string, unknown>,
        ),
    );

    this.logger.log(
      `Found ${widgetsToMigrate.length} widget(s) needing migration out of ${widgets.length} total`,
    );

    if (widgetsToMigrate.length === 0) {
      return;
    }

    for (const widget of widgetsToMigrate) {
      const migratedConfiguration = migrateConfiguration(
        widget.type,
        widget.configuration as unknown as Record<string, unknown>,
      );

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would update widget ${widget.id} configuration from ${JSON.stringify(widget.configuration)} to ${JSON.stringify(migratedConfiguration)}`,
        );
      } else {
        await this.pageLayoutWidgetRepository.update(
          { id: widget.id },
          { configuration: migratedConfiguration },
        );

        this.logger.log(`Updated widget ${widget.id} configuration`);
      }
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] Would have migrated' : 'Successfully migrated'} ${widgetsToMigrate.length} widget(s)`,
    );

    if (!options.dryRun && widgetsToMigrate.length > 0) {
      this.logger.log(
        `Invalidating and recomputing cache for workspace ${workspaceId}`,
      );

      const flatCacheToInvalidate =
        getMetadataRelatedMetadataNames('pageLayoutWidget');

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatPageLayoutWidgetMaps',
        ...flatCacheToInvalidate.map(getMetadataFlatEntityMapsKey),
      ]);

      this.logger.log(`Cache invalidated and recomputed successfully`);
    }
  }
}
