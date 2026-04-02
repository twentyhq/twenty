import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const OLD_UNIVERSAL_IDENTIFIERS_TO_DELETE = new Set([
  '6652773f-b9a9-4fa3-a52c-e2f2e259e430', // deleteSingleRecord
  'cde86f1f-2c13-42b1-812b-f2b2b468cb83', // deleteMultipleRecords
  '8b3a1cae-3e4d-43c1-a71f-48592b2e47ff', // restoreSingleRecord
  '8b740c9d-d99a-45a8-812f-809caaf420ac', // restoreMultipleRecords
  '44a78417-c394-4bc8-961f-98b503030ddb', // destroySingleRecord
  'c630b3fb-7920-40d1-9906-77d0aa797608', // destroyMultipleRecords
  'a934ba8a-ac8f-487d-9cd9-06dfdaec1f49', // exportFromRecordIndex
  'ba339455-f3c2-4ed1-bf77-3e316d7d6a66', // exportFromRecordShow
  'f71f68e5-7b6e-4c03-8161-c48434d7777c', // exportMultipleRecords
]);

const NEW_UNIVERSAL_IDENTIFIERS = new Set([
  'd5a55d57-ed1d-4791-89b8-53b7e121d69d', // deleteRecords
  '2d733846-8cc5-4314-ab79-916ae0801baa', // restoreRecords
  '0ea2ebc4-02ca-4d15-b424-5352b9e487df', // destroyRecords
  'c6f5c54d-d52b-4e75-8188-2190d77126f2', // exportRecords
]);

@Command({
  name: 'upgrade:1-21:deduplicate-engine-commands',
  description:
    'Merge single/multiple record engine command menu items into unified commands (delete, restore, destroy, export)',
})
export class DeduplicateEngineCommandsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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
      `${isDryRun ? '[DRY RUN] ' : ''}Starting deduplication of engine commands for workspace ${workspaceId}`,
    );

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { flatCommandMenuItemMaps: existingFlatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const itemsToDelete = Object.values(
      existingFlatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((item) =>
        OLD_UNIVERSAL_IDENTIFIERS_TO_DELETE.has(item.universalIdentifier),
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        shouldIncludeRecordPageLayouts: true,
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const itemsToCreate = Object.values(
      standardAllFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter((item) => NEW_UNIVERSAL_IDENTIFIERS.has(item.universalIdentifier))
      .filter(
        (item) =>
          !isDefined(
            existingFlatCommandMenuItemMaps.byUniversalIdentifier[
              item.universalIdentifier
            ],
          ),
      );

    const totalChanges = itemsToDelete.length + itemsToCreate.length;

    if (totalChanges === 0) {
      this.logger.log(
        `No engine command deduplication needed for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `Found ${itemsToDelete.length} old command menu item(s) to delete and ${itemsToCreate.length} unified item(s) to create for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${itemsToDelete.length} and create ${itemsToCreate.length} command menu item(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: itemsToCreate,
              flatEntityToDelete: itemsToDelete,
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
        `Failed to deduplicate engine commands:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to deduplicate engine commands for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully deduplicated engine commands for workspace ${workspaceId} (deleted ${itemsToDelete.length}, created ${itemsToCreate.length})`,
    );
  }
}
