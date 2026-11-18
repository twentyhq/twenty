import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const OWNERLESS_PRIVATE_WORKFLOW_CONDITION = `"workspaceId" = $1
  AND "visibility" = 'PRIVATE'
  AND "createdByUserWorkspaceId" IS NULL`;

@RegisteredWorkspaceCommand('2.60.0', 1794991155141)
@Command({
  name: 'upgrade:2-60:share-ownerless-private-workflows',
  description:
    'Share private workflows whose creator is gone with the workspace, since nobody can see them anymore',
})
export class ShareOwnerlessPrivateWorkflowsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
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
        `No data source for workspace ${workspaceId}, skipping ownerless private workflows`,
      );

      return;
    }

    if (options.dryRun ?? false) {
      const [{ count }]: { count: string }[] = await dataSource.query(
        `SELECT count(*) AS count FROM core."workflow" WHERE ${OWNERLESS_PRIVATE_WORKFLOW_CONDITION}`,
        [workspaceId],
      );

      this.logger.log(
        `[DRY RUN] Would share ${count} ownerless private workflow(s) in workspace ${workspaceId}`,
      );

      return;
    }

    const [, sharedWorkflowCount]: [unknown[], number] = await dataSource.query(
      `UPDATE core."workflow"
       SET "visibility" = 'WORKSPACE', "updatedAt" = now()
       WHERE ${OWNERLESS_PRIVATE_WORKFLOW_CONDITION}`,
      [workspaceId],
    );

    if (sharedWorkflowCount === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatWorkflowMaps',
    ]);

    this.logger.log(
      `Shared ${sharedWorkflowCount} ownerless private workflow(s) in workspace ${workspaceId}`,
    );
  }
}
