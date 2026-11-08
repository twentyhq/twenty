import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FeatureFlagKey } from 'twenty-shared/types';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { AccessGroupService } from 'src/engine/permissions/internal/access-group/services/access-group.service';

@RegisteredWorkspaceCommand('2.57.0', 1794096521000)
@Command({
  name: 'upgrade:2-57:recompute-record-access-groups',
  description:
    'Queue a recompute of record access groups where access groups are on, since records written before 2.57 were never given any',
})
export class RecomputeRecordAccessGroupsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly accessGroupService: AccessGroupService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const enabledFlagRows: { exists: number }[] =
      await this.coreDataSource.query(
        `SELECT 1 AS "exists" FROM core."featureFlag" WHERE "workspaceId" = $1 AND "key" = $2 AND "value" = TRUE`,
        [workspaceId, FeatureFlagKey.IS_ACCESS_GROUPS_ENABLED],
      );

    if (enabledFlagRows.length === 0 || options.dryRun) {
      return;
    }

    await this.accessGroupService.syncAccessGroupsAndRecomputeEveryRecord(
      workspaceId,
    );
  }
}
