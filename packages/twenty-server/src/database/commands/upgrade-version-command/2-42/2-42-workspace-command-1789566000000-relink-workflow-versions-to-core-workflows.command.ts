import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { hasCoreWorkflowWorkspaceWorkflowIdColumn } from 'src/engine/core-modules/workflow/utils/has-core-workflow-workspace-workflow-id-column.util';

@RegisteredWorkspaceCommand('2.42.0', 1789566000000)
@Command({
  name: 'upgrade:2-42:relink-workflow-versions-to-core-workflows',
  description:
    'Backfill coreWorkflowId on core workflow versions left unlinked by the mirror creation race',
})
export class RelinkWorkflowVersionsToCoreWorkflowsCommand extends ProvisionedWorkspaceCommandRunner {
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
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping relink`,
      );

      return;
    }

    const queryRunner = dataSource.createQueryRunner();

    await queryRunner.connect();

    const schema = getWorkspaceSchemaName(workspaceId);

    const canonicalParentId = `
      SELECT coalesce(
        (
          SELECT ww."coreWorkflowId"
          FROM "${schema}"."workflow" ww
          WHERE ww."id" = v."workflowId"
            AND ww."coreWorkflowId" IS NOT NULL
        ),
        (
          SELECT c."id"
          FROM core."workflow" c
          WHERE c."workspaceId" = v."workspaceId"
            AND c."workspaceWorkflowId" = v."workflowId"
          ORDER BY c."createdAt" ASC, c."id" ASC
          LIMIT 1
        )
      )`;

    const predicate = `
      WHERE v."workspaceId" = $1
        AND v."coreWorkflowId" IS NULL
        AND (${canonicalParentId}) IS NOT NULL`;

    try {
      if (
        !(await hasCoreWorkflowWorkspaceWorkflowIdColumn((query) =>
          queryRunner.query(query),
        ))
      ) {
        this.logger.warn(
          `core.workflow.workspaceWorkflowId missing for workspace ${workspaceId}, skipping relink`,
        );

        return;
      }

      const [workflowTable] = await queryRunner.query(
        `SELECT to_regclass($1) AS "table"`,
        [`"${schema}"."workflow"`],
      );

      if (!isDefined(workflowTable?.table)) {
        return;
      }

      const [counts] = await queryRunner.query(
        `SELECT count(*)::int AS total
         FROM core."workflowVersion" v
         ${predicate}`,
        [workspaceId],
      );

      if (counts.total === 0) {
        return;
      }

      if (options.dryRun) {
        this.logger.log(
          `[DRY RUN] Would relink ${counts.total} core workflow version row(s) for workspace ${workspaceId}`,
        );

        return;
      }

      await queryRunner.query(
        `UPDATE core."workflowVersion" v
         SET "coreWorkflowId" = (${canonicalParentId})
         ${predicate}`,
        [workspaceId],
      );

      this.logger.log(
        `Relinked ${counts.total} core workflow version row(s) for workspace ${workspaceId}`,
      );
    } finally {
      await queryRunner.release();
    }
  }
}
