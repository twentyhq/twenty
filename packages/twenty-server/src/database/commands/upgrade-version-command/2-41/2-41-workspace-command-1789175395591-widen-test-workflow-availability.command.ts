import { Command } from 'nest-commander';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { buildTestWorkflowAvailabilityUpdate } from 'src/database/commands/upgrade-version-command/2-41/utils/build-test-workflow-availability-update.util';
import { ApplicationService } from 'src/engine/core-modules/application/application.service';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';

@RegisteredWorkspaceCommand('2.41.0', 1789175395591)
@Command({
  name: 'upgrade:2-41:widen-test-workflow-availability',
  description:
    'Offer the Test Workflow command on database event triggers that carry a test record',
})
export class WidenTestWorkflowAvailabilityCommand extends ProvisionedWorkspaceCommandRunner {
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

    const commandMenuItemsToUpdate = buildTestWorkflowAvailabilityUpdate({
      flatCommandMenuItemByUniversalIdentifier:
        flatCommandMenuItemMaps.byUniversalIdentifier,
      now: new Date().toISOString(),
    });

    if (commandMenuItemsToUpdate.length === 0) {
      this.logger.log(
        `Test Workflow command menu item already up to date for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Widening the Test Workflow command menu item availability for workspace ${workspaceId}`,
    );

    if (isDryRun) {
      return;
    }

    const { twentyStandardFlatApplication } =
      await this.applicationService.findWorkspaceTwentyStandardAndCustomApplicationOrThrow(
        { workspaceId },
      );

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          isSystemBuild: true,
          workspaceId,
          applicationUniversalIdentifier:
            twentyStandardFlatApplication.universalIdentifier,
          allFlatEntityOperationByMetadataName: {
            commandMenuItem: {
              flatEntityToCreate: [],
              flatEntityToDelete: [],
              flatEntityToUpdate: commandMenuItemsToUpdate,
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to widen the Test Workflow command menu item availability:\n${JSON.stringify(result, null, 2)}`,
      );

      throw new Error(
        `Failed to widen the Test Workflow command menu item availability for workspace ${workspaceId}`,
      );
    }

    this.logger.log(
      `Widened the Test Workflow command menu item availability for workspace ${workspaceId}`,
    );
  }
}
