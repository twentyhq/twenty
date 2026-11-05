import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  computeFieldMetadataOptionBackfill,
  type EnumFieldToBackfill,
} from 'src/database/commands/upgrade-version-command/2-56/utils/compute-field-metadata-option-backfill.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.56.0', 1793890005250)
@Command({
  name: 'upgrade:2-56:backfill-field-metadata-options',
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

        if (isDryRun) {
          return {
            rewrittenFieldCount: optionsToRewriteByFieldMetadataId.size,
            insertedRowCount: optionRowsToInsert.length,
          };
        }

        if (optionsToRewriteByFieldMetadataId.size > 0) {
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
        }

        if (optionRowsToInsert.length === 0) {
          return {
            rewrittenFieldCount: optionsToRewriteByFieldMetadataId.size,
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
          rewrittenFieldCount: optionsToRewriteByFieldMetadataId.size,
          insertedRowCount: insertedRows.length,
        };
      },
    );

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${result.insertedRowCount} field option row(s) inserted, ${result.rewrittenFieldCount} field(s) with regenerated option ids`,
    );

    if (isDryRun) {
      return;
    }

    await this.workspaceCacheService.invalidateAndRecompute(
      workspaceId,
      withDerivedFieldMetadataMaps([
        'flatFieldMetadataMaps',
        'flatFieldMetadataOptionMaps',
      ]),
    );
  }
}
