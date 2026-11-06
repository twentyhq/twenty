import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  computeFieldMetadataOptionBackfill,
  type EnumFieldToBackfill,
} from 'src/database/commands/upgrade-version-command/2-57/utils/compute-field-metadata-option-backfill.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { isEnumFlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/utils/is-enum-flat-field-metadata.util';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.57.0', 1793970501957)
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

    const { flatFieldMetadataMaps, flatFieldMetadataOptionMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatFieldMetadataOptionMaps',
      ]);

    // Sorted so the same field keeps a shared option id on every run.
    const enumFields: EnumFieldToBackfill[] = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .filter(isEnumFlatFieldMetadata)
      .map(({ id, applicationId, options }) => ({
        id,
        applicationId,
        options,
      }))
      .sort((fieldA, fieldB) => fieldA.id.localeCompare(fieldB.id));

    const { optionsToRewriteByFieldMetadataId, optionRowsToInsert } =
      computeFieldMetadataOptionBackfill({
        enumFields,
        existingFieldMetadataIdByUniversalIdentifier: new Map(
          Object.values(flatFieldMetadataOptionMaps.byUniversalIdentifier)
            .filter(isDefined)
            .map(({ universalIdentifier, fieldMetadataId }) => [
              universalIdentifier,
              fieldMetadataId,
            ]),
        ),
      });

    if (isDryRun) {
      this.logger.log(
        `[DRY RUN] Workspace ${workspaceId}: ${optionRowsToInsert.length} field option row(s) to insert, ${optionsToRewriteByFieldMetadataId.size} field(s) with option ids to regenerate`,
      );

      return;
    }

    const result = await this.coreDataSource.transaction(
      async (entityManager) => {
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
