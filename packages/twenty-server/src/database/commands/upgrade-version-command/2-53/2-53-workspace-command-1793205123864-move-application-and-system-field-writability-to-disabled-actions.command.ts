import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

const WRITE_ACTIONS = ['canUpdateFieldValue'];

// APPLICATION falls back to OPEN; SYSTEM keeps its stored value, which the runtime no longer reads
const WRITABILITY_MOVES = [
  { value: 'APPLICATION', shouldOpenAfterMove: true },
  { value: 'SYSTEM', shouldOpenAfterMove: false },
] as const;

@RegisteredWorkspaceCommand('2.53.0', 1793205123864)
@Command({
  name: 'upgrade:2-53:move-application-and-system-field-writability-to-disabled-actions',
  description:
    'Express APPLICATION and SYSTEM field writability as disabled field permission actions',
})
export class MoveApplicationAndSystemFieldWritabilityToDisabledActionsCommand extends ProvisionedWorkspaceCommandRunner {
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
        `SELECT COUNT(*)::int AS "count" FROM "core"."fieldMetadata"
         WHERE "workspaceId" = $1 AND "writability" IN ('APPLICATION', 'SYSTEM')`,
        [workspaceId],
      );

      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: would review ${count} field(s) with APPLICATION or SYSTEM writability`,
      );

      return;
    }

    let movedFieldCount = 0;

    for (const { value, shouldOpenAfterMove } of WRITABILITY_MOVES) {
      const [movedFields] = await this.coreDataSource.query(
        `UPDATE "core"."fieldMetadata"
         SET ${shouldOpenAfterMove ? `"writability" = 'OPEN',` : ''}
             "disabledFieldPermissionActions" = (
               SELECT jsonb_agg(DISTINCT "action" ORDER BY "action")
               FROM jsonb_array_elements_text(
                 COALESCE("disabledFieldPermissionActions", '[]'::jsonb) || $3::jsonb
               ) AS "action"
             )
         WHERE "workspaceId" = $1
           AND "writability" = $2
           ${shouldOpenAfterMove ? '' : `AND NOT COALESCE("disabledFieldPermissionActions", '[]'::jsonb) @> $3::jsonb`}
         RETURNING "id"`,
        [workspaceId, value, JSON.stringify(WRITE_ACTIONS)],
      );

      movedFieldCount += movedFields.length;
    }

    if (movedFieldCount === 0) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      withDerivedFieldMetadataMaps([
        getMetadataFlatEntityMapsKey('fieldMetadata'),
      ]),
    );

    this.logger.log(
      `Workspace ${workspaceId}: moved APPLICATION or SYSTEM writability of ${movedFieldCount} field update(s) to disabled actions`,
    );
  }
}
