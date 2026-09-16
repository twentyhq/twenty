import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.41.0', 1789580000001)
@Command({
  name: 'upgrade:2-41:backfill-workflow-execution-core-ids',
  description:
    'Backfill durable workflow version mappings and workflow run core ids',
})
export class BackfillWorkflowExecutionCoreIdsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
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

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    try {
      const schema = getWorkspaceSchemaName(workspaceId);

      if (!(await this.hasRequiredColumns(queryRunner, schema))) {
        return;
      }

      if (options.dryRun) {
        return;
      }

      await queryRunner.query(
        `UPDATE core."workflowVersion" coreVersion
         SET "workspaceWorkflowVersionId" = workspaceVersion.id
         FROM "${schema}"."workflowVersion" workspaceVersion
         WHERE coreVersion."workspaceId" = $1
           AND workspaceVersion."coreWorkflowVersionId" = coreVersion.id
           AND coreVersion."workspaceWorkflowVersionId" IS NULL`,
        [workspaceId],
      );
      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" workflowRun
         SET "coreWorkflowVersionId" = workflowVersion."coreWorkflowVersionId"
         FROM "${schema}"."workflowVersion" workflowVersion
         WHERE workflowRun."workflowVersionId" = workflowVersion.id
           AND workflowRun."coreWorkflowVersionId" IS NULL
           AND workflowVersion."coreWorkflowVersionId" IS NOT NULL`,
      );
      await queryRunner.query(
        `UPDATE "${schema}"."workflowRun" workflowRun
         SET "coreWorkflowId" = workflow."coreWorkflowId"
         FROM "${schema}"."workflow" workflow
         WHERE workflowRun."workflowId" = workflow.id
           AND workflowRun."coreWorkflowId" IS NULL
           AND workflow."coreWorkflowId" IS NOT NULL`,
      );
    } finally {
      await queryRunner.release();
    }
  }

  private async hasRequiredColumns(
    queryRunner: QueryRunner,
    schema: string,
  ): Promise<boolean> {
    const rows = await queryRunner.query(
      `SELECT count(*)::int AS count
       FROM information_schema.columns
       WHERE (table_schema = 'core' AND table_name = 'workflowVersion' AND column_name = 'workspaceWorkflowVersionId')
          OR (table_schema = $1 AND table_name = 'workflowVersion' AND column_name = 'coreWorkflowVersionId')
          OR (table_schema = $1 AND table_name = 'workflowRun' AND column_name IN ('coreWorkflowId', 'coreWorkflowVersionId'))`,
      [schema],
    );

    return rows[0]?.count === 4;
  }
}
