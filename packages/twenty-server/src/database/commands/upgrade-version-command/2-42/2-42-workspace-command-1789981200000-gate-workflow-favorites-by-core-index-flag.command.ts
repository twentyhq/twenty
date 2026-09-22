import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildGateWorkflowFavoriteCommandMenuItemUpdates } from 'src/database/commands/upgrade-version-command/2-42/utils/build-gate-workflow-favorite-command-menu-item-updates.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { STANDARD_COMMAND_MENU_ITEMS } from 'src/engine/workspace-manager/twenty-standard-application/constants/standard-command-menu-item.constant';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.42.0', 1789981200000)
@Command({
  name: 'upgrade:2-42:gate-workflow-favorites-by-core-index-flag',
  description:
    'Hide the favorite actions on workflows when the workflow core index feature flag is enabled',
})
export class GateWorkflowFavoritesByCoreIndexFlagCommand extends ProvisionedWorkspaceCommandRunner {
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
    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const commandMenuItemsToUpdate =
      buildGateWorkflowFavoriteCommandMenuItemUpdates({
        flatCommandMenuItems: Object.values(
          flatCommandMenuItemMaps.byUniversalIdentifier,
        ),
        conditionalAvailabilityExpressionByEngineComponentKey: {
          [EngineComponentKey.ADD_TO_FAVORITES]:
            STANDARD_COMMAND_MENU_ITEMS.addToFavorites
              .conditionalAvailabilityExpression,
          [EngineComponentKey.REMOVE_FROM_FAVORITES]:
            STANDARD_COMMAND_MENU_ITEMS.removeFromFavorites
              .conditionalAvailabilityExpression,
        },
        now: new Date().toISOString(),
      });

    if (!isDefined(commandMenuItemsToUpdate[0])) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would gate ${commandMenuItemsToUpdate.length} favorite command menu item(s) for workspace ${workspaceId}`,
      );

      return;
    }

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
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
