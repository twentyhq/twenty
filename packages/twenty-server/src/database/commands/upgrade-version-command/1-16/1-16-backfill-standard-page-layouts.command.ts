import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { updateStandardPageLayoutWidgetsWithWorkspaceFieldIds } from 'src/database/commands/upgrade-version-command/1-16/utils/update-standard-page-layout-widgets-with-workspace-field-ids.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { GlobalWorkspaceDataSourceService } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-datasource.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  MY_FIRST_DASHBOARD_ID,
  prefillDashboards,
} from 'src/engine/workspace-manager/standard-objects-prefill-data/prefill-dashboards';
import { STANDARD_PAGE_LAYOUTS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-page-layout.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { isDefined } from 'twenty-shared/utils';

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

    const flatPageLayout = findFlatEntityByUniversalIdentifier({
      flatEntityMaps: fromFlatPageLayoutMaps,
      universalIdentifier:
        STANDARD_PAGE_LAYOUTS.myFirstDashboard.universalIdentifier,
    });

    if (isDefined(flatPageLayout)) {
      this.logger.log(
        `Skipping command standard page layout already exists in workspace ${workspaceId}`,
      );
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        {
          workspaceId,
        },
      );

    const {
      flatPageLayoutMaps: toFlatPageLayoutMaps,
      flatPageLayoutTabMaps: toFlatPageLayoutTabMaps,
      flatPageLayoutWidgetMaps: rawToFlatPageLayoutWidgetMaps,
    } = computeTwentyStandardApplicationAllFlatEntityMaps({
      now: new Date().toISOString(),
      workspaceId,
      twentyStandardApplicationId: twentyStandardFlatApplication.id,
    });

    const toFlatPageLayoutWidgetMaps =
      updateStandardPageLayoutWidgetsWithWorkspaceFieldIds({
        flatFieldMetadataMaps,
        flatObjectMetadataMaps,
        flatPageLayoutWidgetMaps: rawToFlatPageLayoutWidgetMaps,
      });

    const validateAndbuildResult =
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

    if (isDefined(validateAndbuildResult)) {
      this.logger.error(
        `Failed to create many fields \n ${JSON.stringify(validateAndbuildResult, null, 2)}`,
      );
      throw new Error(
        `Failed to create standard page layout/tab/widgets on workspace ${workspaceId}`,
      );
    }

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
