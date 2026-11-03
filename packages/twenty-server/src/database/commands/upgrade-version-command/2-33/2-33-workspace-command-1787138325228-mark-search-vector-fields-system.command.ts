import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';

@RegisteredWorkspaceCommand('2.33.0', 1787138325228)
@Command({
  name: 'upgrade:2-33:mark-search-vector-fields-system',
  description:
    'Mark searchVector fields as SYSTEM writability on existing workspaces: they are Postgres generated columns nothing may write',
})
export class MarkSearchVectorFieldsSystemCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const filter = `"workspaceId" = $1 AND type = 'TS_VECTOR' AND writability <> 'SYSTEM'`;

    if (options.dryRun) {
      const [{ count }] = await this.coreDataSource.query(
        `SELECT COUNT(*)::int AS "count" FROM core."fieldMetadata" WHERE ${filter}`,
        [workspaceId],
      );

      this.logger.log(
        `[DRY RUN] Would mark ${count} search vector field(s) as SYSTEM for workspace ${workspaceId}`,
      );

      return;
    }

    // Nothing reads writability at runtime, but a later upgrade turns SYSTEM into disabled actions
    await this.coreDataSource.query(
      `UPDATE core."fieldMetadata" SET writability = 'SYSTEM' WHERE ${filter}`,
      [workspaceId],
    );
  }
}
