import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { isWorkspaceObjectNotFoundError } from 'src/database/commands/upgrade-version-command/utils/is-workspace-object-not-found-error.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { WorkspaceOrmManager } from 'src/engine/twenty-orm/workspace-orm.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { type WorkflowWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow.workspace-entity';

@RegisteredWorkspaceCommand('2.40.0', 1789036819010)
@Command({
  name: 'upgrade:2-40:backfill-workspace-workflow-id-on-workflows',
  description:
    'Backfill workspaceWorkflowId on core workflow rows from the workspace workflow mapping',
})
export class BackfillWorkspaceWorkflowIdOnWorkflowsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceOrmManager: WorkspaceOrmManager,
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

    try {
      await this.workspaceOrmManager.executeInWorkspaceContext(async () => {
        const workflowRepository =
          this.workspaceOrmManager.getRepository<WorkflowWorkspaceEntity>(
            'workflow',
            { shouldBypassPermissionChecks: true },
          );

        return workflowRepository.count();
      }, buildSystemAuthContext(workspaceId));
    } catch (error) {
      if (isWorkspaceObjectNotFoundError(error)) {
        return;
      }

      throw error;
    }

    const schema = getWorkspaceSchemaName(workspaceId);

    const mappedWorkspaceWorkflowId = `
      SELECT w.id
      FROM "${schema}"."workflow" w
      WHERE w."coreWorkflowId" = cw.id
      ORDER BY w.id
      LIMIT 1`;

    const targetRowsClause = `
      FROM core."workflow" cw
      WHERE cw."workspaceId" = $1
        AND cw."workspaceWorkflowId" IS NULL
        AND EXISTS (${mappedWorkspaceWorkflowId})`;

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const [counts] = await queryRunner.query(
        `SELECT count(*)::int AS total ${targetRowsClause}`,
        [workspaceId],
      );

      if (counts.total === 0) {
        return;
      }

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would backfill workspaceWorkflowId on ${counts.total} core workflow row(s) for workspace ${workspaceId}`,
        );

        return;
      }

      await queryRunner.query(
        `UPDATE core."workflow" cw
         SET "workspaceWorkflowId" = (${mappedWorkspaceWorkflowId})
         WHERE cw."workspaceId" = $1
           AND cw."workspaceWorkflowId" IS NULL
           AND EXISTS (${mappedWorkspaceWorkflowId})`,
        [workspaceId],
      );

      this.logger.log(
        `Backfilled workspaceWorkflowId on ${counts.total} core workflow row(s) for workspace ${workspaceId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
