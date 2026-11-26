import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findManyFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const HELPER_AGENT_UNIVERSAL_IDENTIFIER =
  '20202020-c7ab-4065-b822-0ca1d5de60a9';

@RegisteredWorkspaceCommand('2.61.0', 1795261783307)
@Command({
  name: 'upgrade:2-61:delete-standard-helper-agent',
  description:
    'Delete the standard Helper agent, its role target and its navigation menu items from existing workspaces',
})
export class DeleteStandardHelperAgentCommand extends ProvisionedWorkspaceCommandRunner {
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
    const {
      flatAgentMaps,
      flatRoleTargetByAgentIdMaps,
      flatNavigationMenuItemMaps,
    } = await this.workspaceCacheService.getOrRecompute(workspaceId, [
      'flatAgentMaps',
      'flatRoleTargetByAgentIdMaps',
      'flatNavigationMenuItemMaps',
    ]);

    const helperAgent =
      flatAgentMaps.byUniversalIdentifier[HELPER_AGENT_UNIVERSAL_IDENTIFIER];

    if (
      !isDefined(helperAgent) ||
      helperAgent.applicationUniversalIdentifier !==
        TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER
    ) {
      return;
    }

    const roleTargetsToDelete = [
      flatRoleTargetByAgentIdMaps[helperAgent.id],
    ].filter(isDefined);

    const navigationMenuItemsToDelete = findManyFlatEntityByIdInFlatEntityMaps({
      flatEntityIds: helperAgent.navigationMenuItemIds,
      flatEntityMaps: flatNavigationMenuItemMaps,
    });

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: deleting the Helper agent with ${roleTargetsToDelete.length} role target(s) and ${navigationMenuItemsToDelete.length} navigation menu item(s)`,
    );

    if (options.dryRun) {
      return;
    }

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          shouldDeferActions: false,
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            agent: {
              flatEntityToCreate: [],
              flatEntityToDelete: [helperAgent],
              flatEntityToUpdate: [],
            },
            roleTarget: {
              flatEntityToCreate: [],
              flatEntityToDelete: roleTargetsToDelete,
              flatEntityToUpdate: [],
            },
            navigationMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: navigationMenuItemsToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      throw new WorkspaceMigrationBuilderException(result);
    }
  }
}
