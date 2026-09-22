import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const OLD_LABEL = 'Create new {objectLabelSingular}';
const OLD_SHORT_LABEL = 'New {objectLabelSingular}';
const NEW_LABEL = 'Create {objectLabelSingular}';
const NEW_SHORT_LABEL = 'Create';

@RegisteredWorkspaceCommand('2.42.0', 1790067478302)
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
    await this.updateLabels(args, false);
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.updateLabels(args, true);
  }

  private async updateLabels(
    { workspaceId, options }: RunOnWorkspaceArgs,
    revert: boolean,
  ): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const existingCommand =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        STANDARD_COMMAND_MENU_ITEMS.createNewRecord.universalIdentifier
      ];

    if (!isDefined(existingCommand)) {
      return;
    }

    const label =
      existingCommand.label === (revert ? NEW_LABEL : OLD_LABEL)
        ? revert
          ? OLD_LABEL
          : NEW_LABEL
        : existingCommand.label;
    const shortLabel =
      existingCommand.shortLabel ===
      (revert ? NEW_SHORT_LABEL : OLD_SHORT_LABEL)
        ? revert
          ? OLD_SHORT_LABEL
          : NEW_SHORT_LABEL
        : existingCommand.shortLabel;

    if (
      label === existingCommand.label &&
      shortLabel === existingCommand.shortLabel
    ) {
      return;
    }

    const commandMenuItemsToUpdate = [
      {
        ...existingCommand,
        label,
        shortLabel,
        updatedAt: new Date().toISOString(),
      },
    ];

    if (options.dryRun ?? false) {
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
