import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WORKFLOW_OBJECT_UNIVERSAL_IDENTIFIER =
  '20202020-62be-406c-b9ca-8caa50d51392';

const STANDARD_ALL_WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER =
  '20202020-b008-4b08-8b08-c0aba11c0008';

const WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION = `
  n."workspaceId" = $1
  AND (
    (n."type" = 'OBJECT' AND n."targetObjectMetadataId" = o.id)
    OR (
      n."type" = 'VIEW'
      AND n."viewId" IN (
        SELECT v.id FROM core."view" v WHERE v."objectMetadataId" = o.id
      )
    )
  )`;

// One per member, since all open the same page: standard, then workspace-wide, then oldest.
const DUPLICATE_WORKFLOW_NAVIGATION_MENU_ITEM_IDS_QUERY = `
  WITH ranked AS (
    SELECT
      n.id,
      n."userWorkspaceId",
      ROW_NUMBER() OVER (
        ORDER BY
          n."universalIdentifier" = $3 DESC,
          n."userWorkspaceId" IS NULL DESC,
          n."createdAt",
          n.id
      ) AS rank
    FROM core."navigationMenuItem" n
    JOIN core."objectMetadata" o
      ON o."workspaceId" = $1 AND o."universalIdentifier" = $2
    WHERE ${WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION}
  )
  SELECT duplicate.id
  FROM ranked duplicate
  WHERE EXISTS (
    SELECT 1
    FROM ranked kept
    WHERE kept.rank < duplicate.rank
      AND (
        kept."userWorkspaceId" IS NULL
        OR kept."userWorkspaceId" = duplicate."userWorkspaceId"
      )
  )`;

@RegisteredWorkspaceCommand('2.56.0', 1793720614286)
@Command({
  name: 'upgrade:2-56:convert-workflow-navigation-menu-items-to-system-page',
  description:
    'Point navigation menu items targeting the workspace workflow object to the Workflows system page',
})
export class ConvertWorkflowNavigationMenuItemsToSystemPageCommand extends ProvisionedWorkspaceCommandRunner {
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
    const duplicateParameters = [
      ...parameters,
      STANDARD_ALL_WORKFLOWS_NAVIGATION_MENU_ITEM_UNIVERSAL_IDENTIFIER,
    ];

    if (options.dryRun) {
      const [{ count }]: { count: string }[] = await dataSource.query(
        `SELECT COUNT(*) AS count
         FROM core."navigationMenuItem" n
         JOIN core."objectMetadata" o
           ON o."workspaceId" = $1 AND o."universalIdentifier" = $2
         WHERE ${WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION}`,
        parameters,
      );
      const duplicates: { id: string }[] = await dataSource.query(
        DUPLICATE_WORKFLOW_NAVIGATION_MENU_ITEM_IDS_QUERY,
        duplicateParameters,
      );

      this.logger.log(
        `[DRY RUN] Would delete ${duplicates.length} duplicate and convert ${Number(count) - duplicates.length} workflow navigation menu item(s) to the Workflows system page for workspace ${workspaceId}`,
      );

      return;
    }

    const [, deletedCount]: [unknown[], number] = await dataSource.query(
      `DELETE FROM core."navigationMenuItem"
       WHERE id IN (${DUPLICATE_WORKFLOW_NAVIGATION_MENU_ITEM_IDS_QUERY})`,
      duplicateParameters,
    );

    const [, convertedCount]: [unknown[], number] = await dataSource.query(
      `UPDATE core."navigationMenuItem" n
       SET "type" = 'SYSTEM_PAGE',
           "systemPageKey" = 'workflows',
           "targetObjectMetadataId" = NULL,
           "viewId" = NULL,
           "updatedAt" = NOW()
       FROM core."objectMetadata" o
       WHERE o."workspaceId" = $1
         AND o."universalIdentifier" = $2
         AND ${WORKFLOW_NAVIGATION_MENU_ITEMS_CONDITION}`,
      parameters,
    );

    if (deletedCount === 0 && convertedCount === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      'flatNavigationMenuItemMaps',
    ]);

    this.logger.log(
      `Deleted ${deletedCount} duplicate and converted ${convertedCount} workflow navigation menu item(s) to the Workflows system page for workspace ${workspaceId}`,
    );
  }
}
