import { Command } from 'nest-commander';

import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { EngineComponentKey } from 'src/engine/metadata-modules/command-menu-item/enums/engine-component-key.enum';
import { type FlatCommandMenuItem } from 'src/engine/metadata-modules/flat-command-menu-item/types/flat-command-menu-item.type';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

const SEE_ACTIVE_VERSION_WORKFLOW_UNIVERSAL_IDENTIFIER =
  '31790508-75ff-4e4c-a768-83bd1b0718e0';

const SEE_ACTIVE_VERSION_WORKFLOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER =
  '6259a4a5-428e-41b9-a032-333c2d51e15f';

@RegisteredWorkspaceCommand('2.41.0', 1789470915878)
@Command({
  name: 'upgrade:2-41:remove-see-active-version-command-menu-item',
  description:
    'Remove the See Active Version workflow command menu item from existing workspaces',
})
export class RemoveSeeActiveVersionCommandMenuItemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly applicationService: ApplicationService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun ?? false;

    const { flatCommandMenuItemMaps, flatFrontComponentMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
        'flatFrontComponentMaps',
      ]);

    const itemToDelete = findFlatEntityByUniversalIdentifier<FlatCommandMenuItem>(
      {
        flatEntityMaps: flatCommandMenuItemMaps,
        universalIdentifier: SEE_ACTIVE_VERSION_WORKFLOW_UNIVERSAL_IDENTIFIER,
      },
    );

    if (!isDefined(itemToDelete)) {
      this.logger.log(
        `See Active Version command menu item does not exist for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const renderedFrontComponentUniversalIdentifier = isDefined(
      itemToDelete.frontComponentId,
    )
      ? flatFrontComponentMaps.universalIdentifierById[
          itemToDelete.frontComponentId
        ]
      : undefined;

    const rendersTheSeeActiveVersionFrontComponent =
      renderedFrontComponentUniversalIdentifier ===
      SEE_ACTIVE_VERSION_WORKFLOW_FRONT_COMPONENT_UNIVERSAL_IDENTIFIER;

    const isLegacyEngineKeyItem =
      !isDefined(itemToDelete.frontComponentId) &&
      itemToDelete.engineComponentKey ===
        EngineComponentKey.SEE_ACTIVE_VERSION_WORKFLOW;

    if (!rendersTheSeeActiveVersionFrontComponent && !isLegacyEngineKeyItem) {
      throw new Error(
        `Command menu item ${SEE_ACTIVE_VERSION_WORKFLOW_UNIVERSAL_IDENTIFIER} in workspace ${workspaceId} is not the See Active Version item (engine component key ${itemToDelete.engineComponentKey}, front component ${renderedFrontComponentUniversalIdentifier ?? 'none'}), refusing to delete`,
      );
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Removing the See Active Version command menu item for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const validateAndBuildResult =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunWorkspaceMigration(
        {
          isSystemBuild: true,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          workspaceId,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [itemToDelete],
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      throw new Error(
        `Failed to remove the See Active Version command menu item for workspace ${workspaceId}: ${JSON.stringify(
          validateAndBuildResult,
          null,
          2,
        )}`,
      );
    }

    this.logger.log(
      `Removed the See Active Version command menu item for workspace ${workspaceId}`,
    );
  }
}
