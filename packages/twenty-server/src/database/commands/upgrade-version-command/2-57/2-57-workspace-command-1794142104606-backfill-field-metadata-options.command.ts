import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  computeFieldMetadataOptionBackfill,
  type EnumFieldToBackfill,
} from 'src/database/commands/upgrade-version-command/2-57/utils/compute-field-metadata-option-backfill.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.57.0', 1794142104606)
@Command({
  name: 'upgrade:2-57:backfill-field-metadata-options',
  description:
    'Create a fieldMetadataOption row for every option of select, multi-select and rating fields.',
})
export class BackfillFieldMetadataOptionsCommand extends ProvisionedWorkspaceCommandRunner {
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
    const isDryRun = options.dryRun ?? false;

    const result = await this.coreDataSource.transaction(
      async (entityManager) => {
        // Read under lock, not from the cache, so a field edit during the upgrade isn't overwritten by the rewrite.
        const enumFields: EnumFieldToBackfill[] = await entityManager.query(
          `SELECT id, "applicationId", options FROM core."fieldMetadata"
            WHERE "workspaceId" = $1 AND type IN ('SELECT', 'MULTI_SELECT', 'RATING')
            ORDER BY id FOR UPDATE`,
          [workspaceId],
        );
        const existingOptionRows: {
          universalIdentifier: string;
          fieldMetadataId: string;
        }[] = await entityManager.query(
          `SELECT "universalIdentifier", "fieldMetadataId" FROM core."fieldMetadataOption"
            WHERE "workspaceId" = $1`,
          [workspaceId],
        );

        const { optionsToRewriteByFieldMetadataId, optionRowsToInsert } =
          computeFieldMetadataOptionBackfill({
            enumFields,
            existingFieldMetadataIdByUniversalIdentifier: new Map(
              existingOptionRows.map(
                ({ universalIdentifier, fieldMetadataId }) => [
                  universalIdentifier,
                  fieldMetadataId,
                ],
              ),
            ),
          });

        const rewrittenFieldMetadataIds = [
          ...optionsToRewriteByFieldMetadataId.keys(),
        ];

        if (isDryRun) {
          return {
            rewrittenFieldCount: rewrittenFieldMetadataIds.length,
            insertedRowCount: optionRowsToInsert.length,
          };
        }

        if (rewrittenFieldMetadataIds.length > 0) {
          await entityManager.query(
            `UPDATE core."fieldMetadata" AS field SET options = rewrite.options
              FROM jsonb_to_recordset($1::jsonb) AS rewrite(id uuid, options jsonb)
              WHERE field.id = rewrite.id AND field."workspaceId" = $2`,
            [
              JSON.stringify(
                [...optionsToRewriteByFieldMetadataId].map(
                  ([fieldMetadataId, rewrittenOptions]) => ({
                    id: fieldMetadataId,
                    options: rewrittenOptions,
                  }),
                ),
              ),
              workspaceId,
            ],
          );

          // Row sync skipped these fields, so stale rows go and kept rows are refreshed, keeping their owner.
          const rewrittenFieldOptionRows = JSON.stringify(
            optionRowsToInsert.filter(({ fieldMetadataId }) =>
              optionsToRewriteByFieldMetadataId.has(fieldMetadataId),
            ),
          );

          await entityManager.query(
            `DELETE FROM core."fieldMetadataOption" existing
              WHERE existing."workspaceId" = $1 AND existing."fieldMetadataId" = ANY($2::uuid[])
                AND NOT EXISTS (
                  SELECT 1 FROM jsonb_to_recordset($3::jsonb) AS row("universalIdentifier" uuid, "fieldMetadataId" uuid)
                  WHERE row."universalIdentifier" = existing."universalIdentifier"
                    AND row."fieldMetadataId" = existing."fieldMetadataId"
                )`,
            [workspaceId, rewrittenFieldMetadataIds, rewrittenFieldOptionRows],
          );

          await entityManager.query(
            `UPDATE core."fieldMetadataOption" AS existing
              SET value = row.value, label = row.label, color = row.color, position = row.position, "updatedAt" = now()
              FROM jsonb_to_recordset($2::jsonb) AS row("universalIdentifier" uuid, "fieldMetadataId" uuid, value varchar, label varchar, color varchar, position double precision)
              WHERE existing."workspaceId" = $1
                AND existing."universalIdentifier" = row."universalIdentifier"
                AND existing."fieldMetadataId" = row."fieldMetadataId"`,
            [workspaceId, rewrittenFieldOptionRows],
          );
        }

        if (optionRowsToInsert.length === 0) {
          return {
            rewrittenFieldCount: rewrittenFieldMetadataIds.length,
            insertedRowCount: 0,
          };
        }

        // Rows the new code already created are kept; the deferred value constraint cannot arbitrate ON CONFLICT.
        const insertedRows: { id: string }[] = await entityManager.query(
          `INSERT INTO core."fieldMetadataOption"
            ("workspaceId", "universalIdentifier", "applicationId", "fieldMetadataId", value, label, color, position)
            SELECT $1, row."universalIdentifier", row."applicationId", row."fieldMetadataId", row.value, row.label, row.color, row.position
            FROM jsonb_to_recordset($2::jsonb) AS row("universalIdentifier" uuid, "applicationId" uuid, "fieldMetadataId" uuid, value varchar, label varchar, color varchar, position double precision)
            WHERE NOT EXISTS (
              SELECT 1 FROM core."fieldMetadataOption" existing
              WHERE existing."fieldMetadataId" = row."fieldMetadataId" AND existing.value = row.value
            )
            ON CONFLICT ("workspaceId", "universalIdentifier") DO NOTHING
            RETURNING id`,
          [workspaceId, JSON.stringify(optionRowsToInsert)],
        );

        return {
          rewrittenFieldCount: rewrittenFieldMetadataIds.length,
          insertedRowCount: insertedRows.length,
        };
      },
    );

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${result.insertedRowCount} field option row(s) to insert, ${result.rewrittenFieldCount} field(s) with option ids to regenerate`,
      );

      return;
    }

    this.logger.log(
      `Workspace ${workspaceId}: ${result.insertedRowCount} field option row(s) inserted, ${result.rewrittenFieldCount} field(s) with regenerated option ids`,
    );

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      withDerivedFieldMetadataMaps([
        'flatFieldMetadataMaps',
        'flatFieldMetadataOptionMaps',
      ]),
    );
  }
}
