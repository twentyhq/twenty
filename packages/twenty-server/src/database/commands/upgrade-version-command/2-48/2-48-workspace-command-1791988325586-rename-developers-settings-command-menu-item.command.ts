import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildDevelopersSettingsCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-48/utils/build-developers-settings-command-menu-item-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.48.0', 1791988325586)
@Command({
  name: 'upgrade:2-48:rename-developers-settings-command-menu-item',
  description:
    'Point the MCP & APIs settings command menu item to the Developers settings page',
})
export class RenameDevelopersSettingsCommandMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncCommandMenuItem(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncCommandMenuItem(args, 'down');
  }

  private async syncCommandMenuItem(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToUpdate =
      buildDevelopersSettingsCommandMenuItemUpdates({
        flatCommandMenuItemByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
        now: new Date().toISOString(),
        direction,
      });

    if (!isNonEmptyArray(commandMenuItemsToUpdate)) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: developers settings command menu item would be updated`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: commandMenuItemsToUpdate,
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateAndBuildResult);
    }
  }
}
