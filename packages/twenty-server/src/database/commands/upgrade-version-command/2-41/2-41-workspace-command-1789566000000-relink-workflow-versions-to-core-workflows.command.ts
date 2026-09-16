import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.41.0', 1789566000000)
@Command({
  name: 'upgrade:2-41:relink-workflow-versions-to-core-workflows',
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

    const predicate = `
      WHERE v."workspaceId" = $1
        AND v."coreWorkflowId" IS NULL
        AND c."workspaceId" = v."workspaceId"
        AND c."workspaceWorkflowId" = v."workflowId"`;

    try {
      const [counts] = await queryRunner.query(
        `SELECT count(*)::int AS total
         FROM core."workflowVersion" v, core."workflow" c
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
         SET "coreWorkflowId" = c."id"
         FROM core."workflow" c
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
