import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { buildChatShareRecordAvailabilityUpdates } from 'src/database/commands/upgrade-version-command/2-45/utils/build-chat-share-record-availability-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.45.0', 1790876759146)
@Command({
  name: 'upgrade:2-45:open-share-record-to-every-object',
  description:
    'Add an unpinned Share command for every shareable object and keep the pinned one on chats, behind the record-level sharing flag',
})
export class OpenShareRecordToEveryObjectCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.syncAvailability(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncAvailability(args, 'down');
  }

  private async syncAvailability(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);

    const now = new Date().toISOString();
    const shareAnyRecord =
      flatCommandMenuItemMaps.byUniversalIdentifier[
        STANDARD_COMMAND_MENU_ITEMS.shareAnyRecord.universalIdentifier
      ];

    const commandMenuItemsToCreate =
      direction === 'up'
        ? buildMissingStandardCommandMenuItemsToCreate({
            commandMenuItemNames: ['shareAnyRecord'],
            flatCommandMenuItemByUniversalIdentifier:
              flatCommandMenuItemMaps.byUniversalIdentifier,
            flatObjectMetadataMaps,
            workspaceId,
            now,
          })
        : [];
    const commandMenuItemsToDelete =
      direction === 'down' && isDefined(shareAnyRecord) ? [shareAnyRecord] : [];
    const commandMenuItemsToUpdate = buildChatShareRecordAvailabilityUpdates({
      flatCommandMenuItemsByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      now,
      direction,
    });

    if (
      commandMenuItemsToCreate.length +
        commandMenuItemsToDelete.length +
        commandMenuItemsToUpdate.length ===
      0
    ) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId} (${direction}): creating ${commandMenuItemsToCreate.length}, deleting ${commandMenuItemsToDelete.length} and updating ${commandMenuItemsToUpdate.length} Share command menu item(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: commandMenuItemsToCreate,
              flatEntityToDelete: commandMenuItemsToDelete,
              flatEntityToUpdate: commandMenuItemsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
