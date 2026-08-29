import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildFixGoToRolesSettingsCommandMenuItemPathSyncOperations } from 'src/database/commands/upgrade-version-command/2-23/utils/build-fix-go-to-roles-settings-command-menu-item-path-sync-operations.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.23.0', 1784566000000)
@Command({
  name: 'upgrade:2-23:fix-go-to-roles-settings-command-menu-item-path',
  description:
    'Point the "Go to Roles Settings" navigation command menu item at /settings/members#roles for existing workspaces',
})
export class FixGoToRolesSettingsCommandMenuItemPathCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemOperations =
      buildFixGoToRolesSettingsCommandMenuItemPathSyncOperations({
        existingFlatCommandMenuItemMaps: flatCommandMenuItemMaps,
        now: new Date().toISOString(),
      });

    const commandMenuItemsToUpdate =
      commandMenuItemOperations.flatEntityToUpdate;

    if (commandMenuItemsToUpdate.length === 0) {
      this.logger.log(
        `"Go to Roles Settings" command menu item path already synced for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Fixing "Go to Roles Settings" command menu item path for workspace ${workspaceId}`,
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
        `Failed to fix "Go to Roles Settings" command menu item path:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to fix "Go to Roles Settings" command menu item path for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully fixed "Go to Roles Settings" command menu item path for workspace ${workspaceId}`,
    );
  }
}
