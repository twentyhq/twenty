import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@Command({
  name: 'upgrade:1-20:backfill-command-menu-items',
  description:
    'Backfill missing standard command menu items for existing workspaces and enable IS_COMMAND_MENU_ITEM_ENABLED feature flag',
})
export class BackfillCommandMenuItemsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly featureFlagService: FeatureFlagService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Starting backfill of missing standard command menu items for workspace ${workspaceId}`,
    );

    const isFeatureFlagAlreadyEnabled =
      await this.featureFlagService.isFeatureEnabled(
        FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED,
        workspaceId,
      );

    if (isFeatureFlagAlreadyEnabled) {
      this.logger.log(
        `IS_COMMAND_MENU_ITEM_ENABLED already enabled for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        shouldIncludeRecordPageLayouts: true,
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToCreate = Object.values(
      standardAllFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(
        (commandMenuItem) =>
          !isDefined(
            existingFlatCommandMenuItemMaps.byUniversalIdentifier[
              commandMenuItem.universalIdentifier
            ],
          ),
      );

    const numberOfCommandMenuItemsToCreate = commandMenuItemsToCreate.length;

    if (numberOfCommandMenuItemsToCreate === 0) {
      this.logger.log(
        `No missing standard command menu items for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `Found ${numberOfCommandMenuItemsToCreate} missing standard command menu item(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would create ${numberOfCommandMenuItemsToCreate} command menu item(s) and enable IS_COMMAND_MENU_ITEM_ENABLED for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: commandMenuItemsToCreate,
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill missing standard command menu items:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill missing standard command menu items for workspace ${workspaceId}`,
      );
    }

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_COMMAND_MENU_ITEM_ENABLED],
      workspaceId,
    );

    this.logger.log(
      `Successfully backfilled ${commandMenuItemsToCreate.length} standard command menu item(s) and enabled IS_COMMAND_MENU_ITEM_ENABLED for workspace ${workspaceId}`,
    );
  }
}
