import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { replaceFlatEntityInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/replace-flat-entity-in-flat-entity-maps-or-throw.util';
import { FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';
import { isFlatPageLayoutWidgetConfigurationOfType } from 'src/engine/metadata-modules/flat-page-layout-widget/utils/is-flat-page-layout-widget-configuration-of-type.util';
import { WidgetConfigurationType } from 'src/engine/metadata-modules/page-layout-widget/enums/widget-configuration-type.type';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  MY_FIRST_DASHBOARD_ID,
  prefillDashboards,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-dashboards';
import { STANDARD_OBJECTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-object.constant';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Command({
  name: 'upgrade:1-16:backfill-standard-page-layouts',
  description: 'Backfill standard page layouts and dashboard records',
})
export class BackfillStandardPageLayoutsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(
    BackfillStandardPageLayoutsCommand.name,
  );

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly globalWorkspaceDataSourceService: GlobalWorkspaceDataSourceService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting backfill of standard page layouts for workspace ${workspaceId}`,
    );

    const {
      flatPageLayoutMaps: fromFlatPageLayoutMaps,
      flatPageLayoutTabMaps: fromFlatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps: fromFlatPageLayoutWidgetMaps,
      featureFlagsMap,
      flatObjectMetadataMaps,
      flatFieldMetadataMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatPageLayoutMaps',
      'flatPageLayoutWidgetMaps',
      'flatPageLayoutTabMaps',
      'featureFlagsMap',
      'flatObjectMetadataMaps',
      'flatFieldMetadataMaps',
    ]);

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );
    const {
      flatPageLayoutMaps: toFlatPageLayoutMaps,
      flatPageLayoutWidgetMaps: toFlatPageLayoutWidgetMaps,
      flatPageLayoutTabMaps: toFlatPageLayoutTabMaps,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    // Fetching the workspace required field id
    const opportunityOwnerUniversalIdentifier =
      STANDARD_OBJECTS.opportunity.fields.owner.universalIdentifier;
    const flatFieldMetadata = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifier: opportunityOwnerUniversalIdentifier,
    });

    if (!isDefined(flatFieldMetadata)) {
      throw new Error(
        `Could not find opportunity owner field ${opportunityOwnerUniversalIdentifier}`,
      );
    }

    const opportunitiesByOwnerWidgetUniversalIdentifier =
      STANDARD_PAGE_LAYOUTS.myFirstDashboard.tabs.tab1.widgets
        .opportunitiesByOwner.universalIdentifier;
    const flatPageLayoutWidget = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: toFlatPageLayoutWidgetMaps,
      universalIdentifier: opportunitiesByOwnerWidgetUniversalIdentifier,
    });

    if (
      !isDefined(flatPageLayoutWidget) ||
      !isFlatPageLayoutWidgetConfigurationOfType(
        flatPageLayoutWidget,
        WidgetConfigurationType.BAR_CHART,
      )
    ) {
      throw new Error(
        `Could not find opportunity owner widget ${opportunitiesByOwnerWidgetUniversalIdentifier}`,
      );
    }

    const updatedFlatPageLayoutWidget: FlatPageLayoutWidget<WidgetConfigurationType.BAR_CHART> =
      {
        ...flatPageLayoutWidget,
        configuration: {
          ...flatPageLayoutWidget.configuration,
          primaryAxisGroupByFieldMetadataId: flatFieldMetadata.id,
          secondaryAxisGroupByFieldMetadataId: flatFieldMetadata.id,
        },
      };
    const tmp = replaceFlatEntityInFlatEntityMapsOrThrow({
      flatEntity: updatedFlatPageLayoutWidget,
      flatEntityMaps: toFlatPageLayoutWidgetMaps,
    });

    // Mutate the related flat maps

    await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigrationFromTo(
      {
        additionalCacheDataMaps: {
          featureFlagsMap,
        },
        buildOptions: {
          isSystemBuild: true,
        },
        fromToAllFlatEntityMaps: {
          flatPageLayoutMaps: {
            from: fromFlatPageLayoutMaps,
            to: toFlatPageLayoutMaps,
          },
          flatPageLayoutTabMaps: {
            from: fromFlatPageLayoutTabMaps,
            to: toFlatPageLayoutTabMaps,
          },
          flatPageLayoutWidgetMaps: {
            from: fromFlatPageLayoutWidgetMaps,
            to: toFlatPageLayoutWidgetMaps,
          },
        },
        workspaceId,
        dependencyAllFlatEntityMaps: {
          flatObjectMetadataMaps,
        },
      },
    );

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const globalDataSource =
      this.globalWorkspaceDataSourceService.getGlobalWorkspaceDataSource();
    const queryRunner = globalDataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const existingDashboard = await queryRunner.manager
        .createQueryBuilder()
        .select('id')
        .from(`${schemaName}.dashboard`, 'dashboard')
        .where('id = :id', { id: MY_FIRST_DASHBOARD_ID })
        .getRawOne();

      if (existingDashboard) {
        this.logger.log(
          `Dashboard already exists for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would create dashboard record for workspace ${workspaceId}`,
        );

        return;
      }

      const { flatPageLayoutMaps } =
        await this.workspaceCacheService.getOrRecompute(workspaceId, [
          'flatPageLayoutMaps',
        ]);

      await prefillDashboards(
        queryRunner.manager,
        schemaName,
        flatPageLayoutMaps,
      );

      this.logger.log(
        `Successfully backfilled standard page layouts for workspace ${workspaceId}`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to backfill standard page layouts for workspace ${workspaceId}`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
