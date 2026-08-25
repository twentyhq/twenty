import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { computeObjectNavigationPayloadRewrite } from 'src/database/commands/upgrade-version-command/2-35/utils/compute-object-navigation-payload-rewrite.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

// Must run after the target backfill (1787572700000): it is what fills the
// column this command relies on before dropping the target from the payload
@RegisteredWorkspaceCommand('2.35.0', 1787647818016)
@Command({
  name: 'upgrade:2-35:rewrite-object-navigation-command-menu-item-payload',
  description:
    'Drop the deprecated payload.objectMetadataItemId of object navigation commands, the target column is the source of truth',
})
export class RewriteObjectNavigationCommandMenuItemPayloadCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { flatCommandMenuItemMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatCommandMenuItemMaps',
      ]);

    const { flatCommandMenuItemsToUpdate, flatCommandMenuItemsWithoutTarget } =
      computeObjectNavigationPayloadRewrite({
        flatCommandMenuItemMaps,
        now: new Date().toISOString(),
      });

    if (flatCommandMenuItemsWithoutTarget.length > 0) {
      this.logger.warn(
        `Skipping ${flatCommandMenuItemsWithoutTarget.length} object navigation command menu item(s) in workspace ${workspaceId} whose target column is still empty: ${flatCommandMenuItemsWithoutTarget.map(({ id }) => id).join(', ')}`,
      );
    }

    if (flatCommandMenuItemsToUpdate.length === 0) {
      this.logger.log(
        `Object navigation command menu item payloads already rewritten for workspace ${workspaceId}`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] Would rewrite' : 'Rewriting'} ${flatCommandMenuItemsToUpdate.length} object navigation command menu item payload(s) for workspace ${workspaceId}`,
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
              flatEntityToDelete: [],
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
        `Failed to rewrite object navigation command menu item payloads:\n${JSON.stringify(validateAndBuildResult, null, 2)}`,
      );

      throw new Error(
        `Failed to rewrite object navigation command menu item payloads for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Successfully rewrote ${flatCommandMenuItemsToUpdate.length} object navigation command menu item payload(s) for workspace ${workspaceId}`,
    );
  }
}
