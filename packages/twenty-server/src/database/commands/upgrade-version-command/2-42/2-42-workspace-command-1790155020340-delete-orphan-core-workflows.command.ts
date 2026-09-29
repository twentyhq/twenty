import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkflowCoreSyncService } from 'src/engine/core-modules/workflow/services/workflow-core-sync.service';
import { hasCoreWorkflowWorkspaceWorkflowIdColumn } from 'src/engine/core-modules/workflow/utils/has-core-workflow-workspace-workflow-id-column.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.42.0', 1790155020340)
@Command({
  name: 'upgrade:2-42:delete-orphan-core-workflows',
  description:
    'Delete custom application core workflows that no live workspace workflow mirrors',
})
export class DeleteOrphanCoreWorkflowsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workflowCoreSyncService: WorkflowCoreSyncService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      return;
    }

    const schema = getWorkspaceSchemaName(workspaceId);

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    let orphanCoreWorkflowIds: string[];

    try {
      if (
        !(await hasCoreWorkflowWorkspaceWorkflowIdColumn((query) =>
          queryRunner.query(query),
        ))
      ) {
        return;
      }

      const workspaceCoreWorkflowIdColumns = await queryRunner.query(
        `SELECT 1
         FROM information_schema.columns
         WHERE table_schema = $1
           AND table_name = 'workflow'
           AND column_name = 'coreWorkflowId'
         LIMIT 1`,
        [schema],
      );

      if (workspaceCoreWorkflowIdColumns.length === 0) {
        return;
      }

      const rows: { id: string }[] = await queryRunner.query(
        `SELECT c.id
         FROM core."workflow" c
         JOIN core."workspace" w ON w.id = c."workspaceId"
         WHERE c."workspaceId" = $1
           AND c."applicationId" = w."workspaceCustomApplicationId"
           AND NOT EXISTS (
             SELECT 1
             FROM "${schema}"."workflow" ww
             WHERE (ww."coreWorkflowId" = c.id OR ww.id = c."workspaceWorkflowId")
               AND ww."deletedAt" IS NULL
           )`,
        [workspaceId],
      );

      orphanCoreWorkflowIds = rows.map(({ id }) => id);
    } finally {
      await queryRunner.release();
    }

    if (orphanCoreWorkflowIds.length === 0) {
      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would delete ${orphanCoreWorkflowIds.length} orphan core workflow(s) for workspace ${workspaceId}`,
      );

      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkflowMaps',
    ]);

    await this.workflowCoreSyncService.deleteFromCore(
      workspaceId,
      orphanCoreWorkflowIds,
    );

    this.logger.log(
      `Deleted ${orphanCoreWorkflowIds.length} orphan core workflow(s) for workspace ${workspaceId}`,
    );
  }
}
