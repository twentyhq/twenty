import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildRecordCreationCommandLabelUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-record-creation-command-label-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.42.0', 1790115314731)
@Command({
  name: 'upgrade:2-42:update-record-creation-command-labels',
  description:
    'Update the standard record creation command labels in existing workspaces',
})
export class UpdateRecordCreationCommandLabelsCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.updateLabels({ ...args, direction: 'up' });
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.updateLabels({ ...args, direction: 'down' });
  }

  private async updateLabels({
    workspaceId,
    options,
    direction,
  }: RunOnWorkspaceArgs & { direction: 'up' | 'down' }): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToUpdate = buildRecordCreationCommandLabelUpdates({
      flatCommandMenuItemByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      direction,
      now: new Date().toISOString(),
    });

    if (!isNonEmptyArray(commandMenuItemsToUpdate)) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: record creation command labels would be updated`,
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
