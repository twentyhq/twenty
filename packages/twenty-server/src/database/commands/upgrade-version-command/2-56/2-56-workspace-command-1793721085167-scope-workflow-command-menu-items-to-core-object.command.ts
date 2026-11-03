import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-62be-406c-b9ca-8caa50d51392';

const WORKFLOW_COMMAND_MENU_ITEMS_CONDITION = `
  c."workspaceId" = $1
  AND c."availabilityObjectMetadataId" = o.id`;

@RegisteredWorkspaceCommand('2.56.0', 1793721085167)
@Command({
  name: 'upgrade:2-56:scope-workflow-command-menu-items-to-core-object',
  description:
    'Scope command menu items targeting the workspace workflow object to the workflow core object',
})
export class ScopeWorkflowCommandMenuItemsToCoreObjectCommand extends ProvisionedWorkspaceCommandRunner {
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

    const parameters = [workspaceId, WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER];

    if (options.dryRun) {
      const [{ count }]: { count: string }[] = await dataSource.query(
        `SELECT COUNT(*) AS count
         FROM core."commandMenuItem" c
         JOIN core."objectMetadata" o
           ON o."workspaceId" = $1 AND o."universalIdentifier" = $2
         WHERE ${WORKFLOW_COMMAND_MENU_ITEMS_CONDITION}`,
        parameters,
      );

      this.logger.log(
        `[DRY RUN] Would scope ${count} workflow command menu item(s) to the workflow core object for workspace ${workspaceId}`,
      );

      return;
    }

    const [, scopedCount]: [unknown[], number] = await dataSource.query(
      `UPDATE core."commandMenuItem" c
       SET "availabilityObjectMetadataId" = NULL,
           "availabilityCoreObjectName" = 'workflow',
           "overrides" = NULLIF(c."overrides" - 'availabilityObjectMetadataId', '{}'::jsonb),
           "updatedAt" = NOW()
       FROM core."objectMetadata" o
       WHERE o."workspaceId" = $1
         AND o."universalIdentifier" = $2
         AND ${WORKFLOW_COMMAND_MENU_ITEMS_CONDITION}`,
      parameters,
    );

    if (scopedCount === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatCommandMenuItemMaps',
    ]);

    this.logger.log(
      `Scoped ${scopedCount} workflow command menu item(s) to the workflow core object for workspace ${workspaceId}`,
    );
  }
}
