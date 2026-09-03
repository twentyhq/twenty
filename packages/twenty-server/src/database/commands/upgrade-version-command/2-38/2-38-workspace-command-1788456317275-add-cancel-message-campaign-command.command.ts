import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.38.0', 1788456317275)
@Command({
  name: 'upgrade:2-38:add-cancel-message-campaign-command',
  description:
    'Add the Cancel Campaign command so a sending campaign can be stopped from the UI',
})
export class AddCancelMessageCampaignCommandCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { universalIdentifier } =
      STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign;

    if (
      isDefined(flatCommandMenuItemMaps.byUniversalIdentifier[universalIdentifier])
    ) {
      return;
    }

    const siblingCommandMenuItem =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier
      ];

    if (!isDefined(siblingCommandMenuItem)) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would add the Cancel Campaign command for workspace ${workspaceId}`,
      );

      return;
    }

    const flatCommandMenuItemToCreate =
      createStandardCommandMenuItemFlatMetadata({
        commandMenuItemName: 'cancelMessageCampaign',
        commandMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId: siblingCommandMenuItem.applicationId,
        dependencyFlatEntityMaps: { flatObjectMetadataMaps },
        now: new Date().toISOString(),
      });

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [flatCommandMenuItemToCreate],
              flatEntityToDelete: [],
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
  }
}
