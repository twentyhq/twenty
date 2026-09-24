import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { buildSendMessageCampaignAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-39/utils/build-send-message-campaign-availability-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.39.0', 1788701316981)
@Command({
  name: 'upgrade:2-39:align-message-campaign-commands',
  description:
    'Restrict Send Campaign and Send Test to a single selected campaign, gate them behind the email group feature flag, and add the Cancel Campaign command',
})
export class AlignMessageCampaignCommandsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
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

    const now = new Date().toISOString();

    const commandMenuItemsToUpdate =
      buildSendMessageCampaignAvailabilityUpdates({
        flatCommandMenuItemByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
        now,
      });

    const commandMenuItemsToCreate = buildMissingStandardCommandMenuItemsToCreate(
      {
        commandMenuItemNames: ['cancelMessageCampaign'],
        flatCommandMenuItemByUniversalIdentifier:
          flatCommandMenuItemMaps.byUniversalIdentifier,
        flatObjectMetadataMaps,
        workspaceId,
        now,
      },
    );

    if (
      commandMenuItemsToUpdate.length === 0 &&
      commandMenuItemsToCreate.length === 0
    ) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would rescope ${commandMenuItemsToUpdate.length} send campaign command(s) and add ${commandMenuItemsToCreate.length} cancel command(s) for workspace ${workspaceId}`,
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
              flatEntityToUpdate: commandMenuItemsToUpdate,
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
  }
}
