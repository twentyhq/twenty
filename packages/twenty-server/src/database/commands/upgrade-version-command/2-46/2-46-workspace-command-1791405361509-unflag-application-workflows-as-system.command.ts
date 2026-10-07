import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.46.0', 1791405361509)
@Command({
  name: 'upgrade:2-46:unflag-application-workflows-as-system',
  description:
    'Stop flagging application workflows as system so they show in the workflows list',
})
export class UnflagApplicationWorkflowsAsSystemCommand extends ProvisionedWorkspaceCommandRunner {
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
      return;
    }

    if (options.dryRun ?? false) {
      this.logger.log(
        `[DRY RUN] Would unflag application workflows as system for workspace ${workspaceId}`,
      );

      return;
    }

    const [rows]: [{ id: string }[], number] = await dataSource.query(
      `UPDATE core."workflow" workflow
       SET "isSystem" = false
       WHERE workflow."workspaceId" = $1
         AND workflow."isSystem" = true
         AND workflow."applicationId" NOT IN (
           SELECT workspace."workspaceCustomApplicationId" FROM core."workspace" workspace WHERE workspace.id = $1
           UNION
           SELECT application.id FROM core."application" application
           WHERE application."workspaceId" = $1 AND application."universalIdentifier" = $2
         )
       RETURNING workflow.id`,
      [workspaceId, TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER],
    );

    if (rows.length > 0) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowMaps',
      ]);
    }

    this.logger.log(
      `Workspace ${workspaceId}: unflagged ${rows.length} application workflow(s) as system`,
    );
  }
}
