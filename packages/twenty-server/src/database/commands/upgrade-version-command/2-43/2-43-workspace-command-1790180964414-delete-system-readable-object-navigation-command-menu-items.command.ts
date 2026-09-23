import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { findSystemReadableObjectNavigationCommandMenuItems } from 'src/database/commands/upgrade-version-command/2-43/utils/find-system-readable-object-navigation-command-menu-items.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.43.0', 1790180964414)
@Command({
  name: 'upgrade:2-43:delete-system-readable-object-navigation-command-menu-items',
  description:
    'Delete the "Go to" navigation command menu items targeting SYSTEM-readable objects',
})
export class DeleteSystemReadableObjectNavigationCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const commandMenuItemsToDelete =
      findSystemReadableObjectNavigationCommandMenuItems({
        flatCommandMenuItems: Object.values(
          flatCommandMenuItemMaps.byUniversalIdentifier,
        ),
        flatObjectMetadataMaps,
      });

    if (commandMenuItemsToDelete.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would delete ${commandMenuItemsToDelete.length} SYSTEM-readable object navigation command menu item(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: commandMenuItemsToDelete,
              flatEntityToUpdate: [],
            },
          },
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(validateAndBuildResult);
    }

    this.logger.log(
      `Deleted ${commandMenuItemsToDelete.length} SYSTEM-readable object navigation command menu item(s) for workspace ${workspaceId}`,
    );
  }
}
