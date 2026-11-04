import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { rescopeWorkflowCommandMenuItem } from 'src/database/commands/upgrade-version-command/2-56/utils/rescope-workflow-command-menu-item.util';

const WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-62be-406c-b9ca-8caa50d51392';

@RegisteredWorkspaceCommand('2.56.0', 1793783100804)
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

    const [workflowObjectMetadata]: { id: string }[] = await dataSource.query(
      `SELECT id FROM core."objectMetadata"
       WHERE "workspaceId" = $1 AND "universalIdentifier" = $2`,
      [workspaceId, WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER],
    );

    if (!isDefined(workflowObjectMetadata)) {
      return;
    }

    const candidateRows: {
      id: string;
      availabilityObjectMetadataId: string | null;
      availabilityCoreObjectName: string | null;
      overrides: unknown;
    }[] = await dataSource.query(
      `SELECT id, "availabilityObjectMetadataId", "availabilityCoreObjectName", overrides
       FROM core."commandMenuItem"
       WHERE "workspaceId" = $1
         AND ("availabilityObjectMetadataId" = $2 OR strpos(overrides::text, $2::text) > 0)`,
      [workspaceId, workflowObjectMetadata.id],
    );

    const rescopedRows = candidateRows.flatMap(({ id, ...row }) => {
      const rescopedRow = rescopeWorkflowCommandMenuItem({
        row,
        workflowObjectMetadataId: workflowObjectMetadata.id,
      });

      return isDefined(rescopedRow) ? [{ id, ...rescopedRow }] : [];
    });

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would rescope ${rescopedRows.length} workflow command menu item(s) for workspace ${workspaceId}`,
      );

      return;
    }

    if (rescopedRows.length === 0) {
      return;
    }

    await dataSource.transaction(async (entityManager) => {
      for (const rescopedRow of rescopedRows) {
        await entityManager.query(
          `UPDATE core."commandMenuItem"
           SET "availabilityObjectMetadataId" = $2,
               "availabilityCoreObjectName" = $3,
               overrides = $4::jsonb,
               "updatedAt" = NOW()
           WHERE id = $1`,
          [
            rescopedRow.id,
            rescopedRow.availabilityObjectMetadataId,
            rescopedRow.availabilityCoreObjectName,
            isDefined(rescopedRow.overrides)
              ? JSON.stringify(rescopedRow.overrides)
              : null,
          ],
        );
      }
    });

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatCommandMenuItemMaps',
    ]);

    this.logger.log(
      `Rescoped ${rescopedRows.length} workflow command menu item(s) for workspace ${workspaceId}`,
    );
  }
}
