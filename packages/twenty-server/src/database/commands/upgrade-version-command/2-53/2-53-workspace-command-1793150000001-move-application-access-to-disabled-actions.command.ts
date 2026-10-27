import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const DISABLED_ACTIONS_BY_APPLICATION_ACCESS_COLUMN = {
  writability: [
    'canUpdateObjectRecords',
    'canSoftDeleteObjectRecords',
    'canDestroyObjectRecords',
  ],
  readability: ['canReadObjectRecords'],
};

@RegisteredWorkspaceCommand('2.53.0', 1793150000001)
@Command({
  name: 'upgrade:2-53:move-application-access-to-disabled-actions',
  description:
    'Replace APPLICATION object readability and writability with disabled object permission actions',
})
export class MoveApplicationAccessToDisabledActionsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (options.dryRun) {
      const [{ count }] = await this.coreDataSource.query(
        `SELECT COUNT(*)::int AS "count" FROM "core"."objectMetadata"
         WHERE "workspaceId" = $1 AND ("writability" = 'APPLICATION' OR "readability" = 'APPLICATION')`,
        [workspaceId],
      );

      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would move APPLICATION access of ${count} object(s) to disabled actions`,
      );

      return;
    }

    let movedObjectCount = 0;

    for (const [column, disabledActions] of Object.entries(
      DISABLED_ACTIONS_BY_APPLICATION_ACCESS_COLUMN,
    )) {
      const [movedObjects] = await this.coreDataSource.query(
        `UPDATE "core"."objectMetadata"
         SET "${column}" = 'OPEN',
             "disabledObjectPermissionActions" = (
               SELECT jsonb_agg(DISTINCT "action" ORDER BY "action")
               FROM jsonb_array_elements_text(
                 COALESCE("disabledObjectPermissionActions", '[]'::jsonb) || $2::jsonb
               ) AS "action"
             )
         WHERE "workspaceId" = $1 AND "${column}" = 'APPLICATION'
         RETURNING "id"`,
        [workspaceId, JSON.stringify(disabledActions)],
      );

      movedObjectCount += movedObjects.length;
    }

    if (movedObjectCount === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      getMetadataFlatEntityMapsKey('objectMetadata'),
    ]);

    this.logger.log(
      `Workspace ${workspaceId}: moved APPLICATION access of ${movedObjectCount} object(s) to disabled actions`,
    );
  }
}
