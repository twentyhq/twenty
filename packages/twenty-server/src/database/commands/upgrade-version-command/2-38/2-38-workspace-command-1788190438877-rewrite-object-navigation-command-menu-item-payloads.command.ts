import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeObjectNavigationPayloadRewrite } from 'src/database/commands/upgrade-version-command/2-38/utils/compute-object-navigation-payload-rewrite.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.38.0', 1788190438877)
@Command({
  name: 'upgrade:2-38:rewrite-object-navigation-command-menu-item-payloads',
  description:
    'Null legacy { objectMetadataItemId } navigation payloads, the target being carried by navigationTargetObjectMetadataId since the 2-35 backfill',
})
export class RewriteObjectNavigationCommandMenuItemPayloadsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatCommandMenuItemsToUpdate, flatCommandMenuItemsToDelete } =
      computeObjectNavigationPayloadRewrite({
        flatCommandMenuItemMaps,
        flatObjectMetadataMaps,
        now: new Date().toISOString(),
      });

    if (flatCommandMenuItemsToDelete.length > 0) {
      this.logger.warn(
        `${isDryRun ? '[DRY RUN] Would delete' : 'Deleting'} ${flatCommandMenuItemsToDelete.length} orphaned navigation command menu item(s) in workspace ${workspaceId}, their payload points at a missing object: ${flatCommandMenuItemsToDelete.map(({ id }) => id).join(', ')}`,
      );
    }

    if (
      flatCommandMenuItemsToUpdate.length === 0 &&
      flatCommandMenuItemsToDelete.length === 0
    ) {
      this.logger.log(
        `Navigation command menu item payloads already rewritten for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would rewrite' : 'Rewriting'} ${flatCommandMenuItemsToUpdate.length} navigation command menu item payload(s) for workspace ${workspaceId}`,
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
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: flatCommandMenuItemsToDelete,
              flatEntityToUpdate: flatCommandMenuItemsToUpdate,
            },
          },
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
        },
      );

    if (validateAndBuildResult.status === 'fail') {
      this.logger.error(
        `Failed to rewrite navigation command menu item payloads:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to rewrite navigation command menu item payloads for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully rewrote ${flatCommandMenuItemsToUpdate.length} and deleted ${flatCommandMenuItemsToDelete.length} navigation command menu item(s) for workspace ${workspaceId}`,
    );
  }
}
