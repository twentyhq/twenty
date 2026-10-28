import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WRITE_ACTIONS = [
  'canUpdateObjectRecords',
  'canSoftDeleteObjectRecords',
  'canDestroyObjectRecords',
];

const READ_ACTIONS = ['canReadObjectRecords'];

// APPLICATION falls back to OPEN; SYSTEM keeps its stored value, which the runtime no longer reads
const ACCESS_MOVES = [
  {
    column: 'writability',
    value: 'APPLICATION',
    shouldOpenAfterMove: true,
    disabledActions: WRITE_ACTIONS,
  },
  {
    column: 'readability',
    value: 'APPLICATION',
    shouldOpenAfterMove: true,
    disabledActions: READ_ACTIONS,
  },
  {
    column: 'writability',
    value: 'SYSTEM',
    shouldOpenAfterMove: false,
    disabledActions: WRITE_ACTIONS,
  },
  {
    column: 'readability',
    value: 'SYSTEM',
    shouldOpenAfterMove: false,
    disabledActions: READ_ACTIONS,
  },
] as const;

@RegisteredWorkspaceCommand('2.53.0', 1793176233512)
@Command({
  name: 'upgrade:2-53:move-application-and-system-access-to-disabled-actions',
  description:
    'Express APPLICATION and SYSTEM object readability and writability as disabled object permission actions',
})
export class MoveApplicationAndSystemAccessToDisabledActionsCommand extends ProvisionedWorkspaceCommandRunner {
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
         WHERE "workspaceId" = $1
           AND ("writability" IN ('APPLICATION', 'SYSTEM') OR "readability" IN ('APPLICATION', 'SYSTEM'))`,
        [workspaceId],
      );

      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would review ${count} object(s) with APPLICATION or SYSTEM access`,
      );

      return;
    }

    let movedObjectCount = 0;

    for (const { column, value, shouldOpenAfterMove, disabledActions } of ACCESS_MOVES) {
      const [movedObjects] = await this.coreDataSource.query(
        `UPDATE "core"."objectMetadata"
         SET ${shouldOpenAfterMove ? `"${column}" = 'OPEN',` : ''}
             "disabledObjectPermissionActions" = (
               SELECT jsonb_agg(DISTINCT "action" ORDER BY "action")
               FROM jsonb_array_elements_text(
                 COALESCE("disabledObjectPermissionActions", '[]'::jsonb) || $3::jsonb
               ) AS "action"
             )
         WHERE "workspaceId" = $1
           AND "${column}" = $2
           ${shouldOpenAfterMove ? '' : `AND NOT COALESCE("disabledObjectPermissionActions", '[]'::jsonb) @> $3::jsonb`}
         RETURNING "id"`,
        [workspaceId, value, JSON.stringify(disabledActions)],
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
      `Workspace ${workspaceId}: moved APPLICATION or SYSTEM access of ${movedObjectCount} object update(s) to disabled actions`,
    );
  }
}
