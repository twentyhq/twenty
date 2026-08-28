import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeSettingsNavigationDisplayFieldRestore } from 'src/database/commands/upgrade-version-command/2-37/utils/compute-settings-navigation-display-field-restore.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.37.0', 1787840804000)
@Command({
  name: 'upgrade:2-37:restore-settings-navigation-command-menu-item-labels',
  description:
    'Restore the standard label, shortLabel and icon on the path-based settings navigation command menu items that upgrade:2-33 overwrote with object placeholder templates',
})
export class RestoreSettingsNavigationCommandMenuItemLabelsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const flatCommandMenuItemsToUpdate =
      computeSettingsNavigationDisplayFieldRestore({
        flatCommandMenuItemMaps,
        now: new Date().toISOString(),
      });

    if (flatCommandMenuItemsToUpdate.length === 0) {
      this.logger.log(
        `Settings navigation command menu item labels already match the standard definition for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would restore' : 'Restoring'} ${flatCommandMenuItemsToUpdate.length} settings navigation command menu item label(s) for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
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
        `Failed to restore settings navigation command menu item labels:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to restore settings navigation command menu item labels for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully restored ${flatCommandMenuItemsToUpdate.length} settings navigation command menu item label(s) for workspace ${workspaceId}`,
    );
  }
}
