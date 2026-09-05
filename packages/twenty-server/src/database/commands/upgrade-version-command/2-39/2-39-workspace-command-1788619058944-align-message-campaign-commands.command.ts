import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildSendMessageCampaignAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-39/utils/build-send-message-campaign-availability-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { createStandardCommandMenuItemFlatMetadata } from 'src/engine/workspace-manager/twenty-standard-application/utils/command-menu-item/create-standard-command-menu-item-flat-metadata.util';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.39.0', 1788619058944)
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

    const commandMenuItemsToCreate = this.buildCancelCommandMenuItemToCreate({
      flatCommandMenuItemByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      flatObjectMetadataMaps,
      workspaceId,
      now,
    });

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

  private buildCancelCommandMenuItemToCreate({
    flatCommandMenuItemByUniversalIdentifier,
    flatObjectMetadataMaps,
    workspaceId,
    now,
  }: {
    flatCommandMenuItemByUniversalIdentifier: Record<
      string,
      FlatCommandMenuItem | undefined
    >;
    flatObjectMetadataMaps: FlatEntityMaps<FlatObjectMetadata>;
    workspaceId: string;
    now: string;
  }): FlatCommandMenuItem[] {
    const { universalIdentifier } =
      STANDARD_COMMAND_MENU_ITEMS.cancelMessageCampaign;

    if (
      isDefined(flatCommandMenuItemByUniversalIdentifier[universalIdentifier])
    ) {
      return [];
    }

    const siblingCommandMenuItem =
      flatCommandMenuItemByUniversalIdentifier[
        STANDARD_COMMAND_MENU_ITEMS.sendMessageCampaign.universalIdentifier
      ];

    if (!isDefined(siblingCommandMenuItem)) {
      return [];
    }

    return [
      createStandardCommandMenuItemFlatMetadata({
        commandMenuItemName: 'cancelMessageCampaign',
        commandMenuItemId: v4(),
        workspaceId,
        twentyStandardApplicationId: siblingCommandMenuItem.applicationId,
        dependencyFlatEntityMaps: { flatObjectMetadataMaps },
        now,
      }),
    ];
  }
}
