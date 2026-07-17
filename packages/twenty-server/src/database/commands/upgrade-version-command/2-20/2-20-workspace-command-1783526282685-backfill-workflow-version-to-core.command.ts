import { Command } from 'nest-commander';
import { EntityMetadataNotFoundError } from 'typeorm/error/EntityMetadataNotFoundError';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkflowVersionCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-version-core-sync.service';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { type WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@RegisteredWorkspaceCommand('2.20.0', 1783526282685)
@Command({
  name: 'upgrade:2-20:backfill-workflow-version-to-core',
  description:
    'Copy each workspace workflowVersion (trigger, steps, status, workflowId) into the core workflowVersion table, preserving ids',
})
export class BackfillWorkflowVersionToCoreCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    private readonly workflowVersionCoreSyncService: WorkflowVersionCoreSyncService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    let workspaceWorkflowVersions: WorkflowVersionWorkspaceEntity[];

    try {
      workspaceWorkflowVersions =
        await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
          async () => {
            const workflowVersionRepository =
              await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
                workspaceId,
                'workflowVersion',
                { shouldBypassPermissionChecks: true },
              );

            return workflowVersionRepository.find();
          },
          buildSystemAuthContext(workspaceId),
        );
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
        `[DRY RUN] Would upsert ${workspaceWorkflowVersions.length} workflowVersion row(s) into core for workspace ${workspaceId}`,
      );

      return;
    }

    await this.workflowVersionCoreSyncService.upsertToCore(
      workspaceId,
      workspaceWorkflowVersions,
    );

    this.logger.log(
      `Backfilled ${workspaceWorkflowVersions.length} workflowVersion row(s) into core for workspace ${workspaceId}`,
    );
  }
}
