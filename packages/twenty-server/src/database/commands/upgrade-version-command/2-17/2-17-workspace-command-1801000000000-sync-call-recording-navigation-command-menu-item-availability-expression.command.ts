import { Command } from 'nest-commander';

import { ActiveOrSuspendedWorkspaceCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations } from 'src/database/commands/upgrade-version-command/2-17/utils/build-call-recording-navigation-command-menu-item-availability-expression-sync-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.17.0', 1801000000000)
@Command({
  name: 'upgrade:2-17:sync-call-recording-navigation-command-menu-item-availability-expression',
  description:
    'Remove the retired call recording feature-flag gate from existing CallRecording navigation command menu items',
})
export class SyncCallRecordingNavigationCommandMenuItemAvailabilityExpressionCommand extends ActiveOrSuspendedWorkspaceCommandRunner {
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

    const commandMenuItemOperations =
      buildCallRecordingNavigationCommandMenuItemAvailabilityExpressionSyncOperations(
        {
          existingFlatCommandMenuItemMaps: flatCommandMenuItemMaps,
          existingFlatObjectMetadataMaps: flatObjectMetadataMaps,
          now: new Date().toISOString(),
        },
      );

    const commandMenuItemsToUpdate =
      commandMenuItemOperations.flatEntityToUpdate;

    if (commandMenuItemsToUpdate.length === 0) {
      this.logger.log(
        `CallRecording navigation command menu item availability expression already synced for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Syncing ${commandMenuItemsToUpdate.length} CallRecording navigation command menu item availability expression(s) for workspace ${workspaceId}`,
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
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: commandMenuItemOperations,
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to sync CallRecording navigation command menu item availability expression:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to sync CallRecording navigation command menu item availability expression for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully synced ${commandMenuItemsToUpdate.length} CallRecording navigation command menu item availability expression(s) for workspace ${workspaceId}`,
    );
  }
}
