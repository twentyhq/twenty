import { Command } from 'nest-commander';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { computeTwentyStandardApplicationAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/utils/twenty-standard-application-all-flat-entity-maps.constant';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const DUPLICATE_MESSAGE_LIST_UNIVERSAL_IDENTIFIER =
  STANDARD_COMMAND_MENU_ITEMS.duplicateMessageList.universalIdentifier;

@RegisteredWorkspaceCommand('2.39.0', 1788639976437)
@Command({
  name: 'upgrade:2-39:add-duplicate-message-list-command-menu-item',
  description:
    'Add the pinned Duplicate List command menu item on message list records to existing workspaces',
})
export class AddDuplicateMessageListCommandMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
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

    if (
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.messageList.universalIdentifier
        ],
      ) ||
      !isDefined(
        flatObjectMetadataMaps.byUniversalIdentifier[
          STANDARD_OBJECTS.messageListMember.universalIdentifier
        ],
      )
    ) {
      this.logger.log(
        `The messageList or messageListMember object is missing for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    if (
      isDefined(
        flatCommandMenuItemMaps.byUniversalIdentifier[
          DUPLICATE_MESSAGE_LIST_UNIVERSAL_IDENTIFIER
        ],
      )
    ) {
      this.logger.log(
        `Duplicate List command menu item already exists for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const { allFlatEntityMaps: standardAllFlatEntityMaps } =
      computeTwentyStandardApplicationAllFlatEntityMaps({
        now: new Date().toISOString(),
        workspaceId,
        twentyStandardApplicationId: twentyStandardFlatApplication.id,
      });

    const itemToCreate =
      standardAllFlatEntityMaps.flatCommandMenuItemMaps.byUniversalIdentifier[
        DUPLICATE_MESSAGE_LIST_UNIVERSAL_IDENTIFIER
      ];

    if (!isDefined(itemToCreate)) {
      throw new Error(
        'Duplicate List command menu item is missing from the standard application definition',
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Adding the Duplicate List command menu item for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [itemToCreate],
              flatEntityToDelete: [],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new Error(
        `Failed to add the Duplicate List command menu item for workspace ${workspaceId}: ${JSON.stringify(result, null, 2)}`,
      );
    }

    this.logger.log(
      `Added the Duplicate List command menu item for workspace ${workspaceId}`,
    );
  }
}
