import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeObjectNavigationTargetBackfill } from 'src/database/commands/upgrade-version-command/2-35/utils/compute-object-navigation-target-backfill.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.35.0', 1787572700000)
@Command({
  name: 'upgrade:2-35:backfill-command-menu-item-target-object-metadata',
  description:
    'Derive commandMenuItem.navigationTargetObjectMetadataId from the object navigation payload',
})
export class BackfillCommandMenuItemTargetObjectMetadataCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const { flatCommandMenuItemsToUpdate, flatCommandMenuItemsToDelete } =
      computeObjectNavigationTargetBackfill({
        flatCommandMenuItemMaps,
        flatObjectMetadataMaps,
        now: new Date().toISOString(),
      });

    if (flatCommandMenuItemsToDelete.length > 0) {
      this.logger.warn(
        `${isDryRun ? '[DRY RUN] Would delete' : 'Deleting'} ${flatCommandMenuItemsToDelete.length} orphaned navigation command menu item(s) in workspace ${workspaceId}, their payload points at a missing object: ${flatCommandMenuItemsToDelete.map(({ id }) => id).join(', ')}`,
      );
    }

    if (
      flatCommandMenuItemsToUpdate.length === 0 &&
      flatCommandMenuItemsToDelete.length === 0
    ) {
      this.logger.log(
        `Navigation command menu item targets already backfilled for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would backfill' : 'Backfilling'} ${flatCommandMenuItemsToUpdate.length} navigation command menu item target(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatCommandMenuItemsToDelete,
              flatEntityToUpdate: flatCommandMenuItemsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to backfill navigation command menu item targets:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to backfill navigation command menu item targets for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully backfilled ${flatCommandMenuItemsToUpdate.length} and deleted ${flatCommandMenuItemsToDelete.length} navigation command menu item(s) for workspace ${workspaceId}`,
    );
  }
}
