import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

// One-time migration to the soft-ref model after coreWorkflowVersionId is
// provisioned. Re-runs the sync: upsertToCore purges each legacy shared-id
// core row (id === record id) and rebuilds a deterministic own-id row, then
// links the workspace record.
@RegisteredWorkspaceCommand('2.22.0', 1784193207000)
@Command({
  name: 'upgrade:2-22:backfill-workflow-version-core-links',
  description:
    'Re-run the workflowVersion core sync so workspaces newly provisioned with coreWorkflowVersionId get linked',
})
export class BackfillWorkflowVersionCoreLinksCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(
        `No workspace data source for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    let workspaceWorkflowVersions: WorkflowVersionWorkspaceEntity[];

    try {
      const workflowVersionRepository =
        dataSource.getRepository<WorkflowVersionWorkspaceEntity>(
          'workflowVersion',
          { shouldBypassPermissionChecks: true },
        );

      workspaceWorkflowVersions = await workflowVersionRepository.find();
    } catch (error) {
      if (error instanceof EntityMetadataNotFoundError) {
        this.logger.log(
          `workflowVersion object does not exist for workspace ${workspaceId}, skipping`,
        );

        return;
      }

      throw error;
    }

    if (options.dryRun === true) {
      this.logger.log(
        `[DRY RUN] Would re-sync ${workspaceWorkflowVersions.length} workflowVersion row(s) for workspace ${workspaceId}`,
      );

      return;
    }

    await this.workflowVersionCoreSyncService.upsertToCore(
      workspaceId,
      workspaceWorkflowVersions,
    );

    this.logger.log(
      `Linked ${workspaceWorkflowVersions.length} workflowVersion row(s) for workspace ${workspaceId}`,
    );
  }
}
