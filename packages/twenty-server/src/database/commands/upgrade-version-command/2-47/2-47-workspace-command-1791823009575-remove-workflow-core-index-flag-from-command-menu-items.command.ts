import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildRemoveWorkflowCoreIndexFlagCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-47/utils/build-remove-workflow-core-index-flag-command-menu-item-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.47.0', 1791823009575)
@Command({
  name: 'upgrade:2-47:remove-workflow-core-index-flag-from-command-menu-items',
  description:
    'Drop the removed workflow core index feature flag from command menu item availability expressions',
})
export class RemoveWorkflowCoreIndexFlagFromCommandMenuItemsCommand extends ProvisionedWorkspaceCommandRunner {
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
    await this.syncAvailabilityExpressions(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncAvailabilityExpressions(args, 'down');
  }

  private async syncAvailabilityExpressions(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToUpdate =
      buildRemoveWorkflowCoreIndexFlagCommandMenuItemUpdates({
        flatCommandMenuItems: Object.values(
          flatCommandMenuItemMaps.byUniversalIdentifier,
        ),
        now: new Date().toISOString(),
        direction,
      });

    if (commandMenuItemsToUpdate.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: updating ${commandMenuItemsToUpdate.length} command menu items`,
    );

    if (options.dryRun) {
      return;
    }

    const commandMenuItemsByApplicationUniversalIdentifier = new Map<
      string,
      FlatCommandMenuItem[]
    >();

    for (const commandMenuItem of commandMenuItemsToUpdate) {
      commandMenuItemsByApplicationUniversalIdentifier.set(
        commandMenuItem.applicationUniversalIdentifier,
        [
          ...(commandMenuItemsByApplicationUniversalIdentifier.get(
            commandMenuItem.applicationUniversalIdentifier,
          ) ?? []),
          commandMenuItem,
        ],
      );
    }

    for (const [
      applicationUniversalIdentifier,
      commandMenuItems,
    ] of commandMenuItemsByApplicationUniversalIdentifier) {
      const migrationArgs = {
        workspaceId,
        isSystemBuild: true,
        applicationUniversalIdentifier,
        allFlatEntityOperationByMetadataName: {
          commandMenuItem: {
            flatEntityToCreate: [],
            flatEntityToDelete: [],
            flatEntityToUpdate: commandMenuItems,
          },
        },
      };

      const result =
        applicationUniversalIdentifier ===
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
          ? await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
              migrationArgs,
            )
          : await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
              migrationArgs,
            );

      if (result.status === 'fail') {
        throw new WorkspaceMigrationBuilderException(result);
      }
    }
  }
}
