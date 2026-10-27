import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildMissingStandardCommandMenuItemsToCreate } from 'src/database/commands/upgrade-version-command/2-39/utils/build-missing-standard-command-menu-items-to-create.util';
import { buildPageCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-53/utils/build-page-command-menu-item-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const PAGE_COMMAND_MENU_ITEM_NAMES = [
  'savePage',
  'cancelPage',
  'nextPageStep',
  'addConnectedAccount',
  'finishAccountSetup',
  'installApplication',
  'openApplicationSettings',
  'addDataModelObject',
  'createDataModelField',
  'seeObjectRecords',
  'createAiSkill',
  'createAiTool',
  'createBillingLimit',
  'generateDpa',
  'deletePageItem',
] as const;

@RegisteredWorkspaceCommand('2.53.0', 1793132225758)
@Command({
  name: 'upgrade:2-53:add-page-command-menu-items',
  description:
    'Add the page header commands and lock the dashboard Save and Cancel pins',
})
export class AddPageCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.apply(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.apply(args, 'down');
  }

  private async apply(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatCommandMenuItemMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatObjectMetadataMaps',
      ]);
    const now = new Date().toISOString();

    const commandMenuItemsToCreate =
      direction === 'up'
        ? buildMissingStandardCommandMenuItemsToCreate({
            commandMenuItemNames: [...PAGE_COMMAND_MENU_ITEM_NAMES],
            flatCommandMenuItemByUniversalIdentifier:
              flatCommandMenuItemMaps.byUniversalIdentifier,
            flatObjectMetadataMaps,
            workspaceId,
            now,
          })
        : [];
    const commandMenuItemsToDelete =
      direction === 'down'
        ? PAGE_COMMAND_MENU_ITEM_NAMES.map(
            (name) =>
              flatCommandMenuItemMaps.byUniversalIdentifier[
                STANDARD_COMMAND_MENU_ITEMS[name].universalIdentifier
              ],
          ).filter(isDefined)
        : [];
    const commandMenuItemsToUpdate = buildPageCommandMenuItemUpdates({
      flatCommandMenuItemMaps,
      direction,
      now,
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
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId} (${direction}): creating ${commandMenuItemsToCreate.length}, deleting ${commandMenuItemsToDelete.length} and updating ${commandMenuItemsToUpdate.length} page command menu item(s)`,
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
