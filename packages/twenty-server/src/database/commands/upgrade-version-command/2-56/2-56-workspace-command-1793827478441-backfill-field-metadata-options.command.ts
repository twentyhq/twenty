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

@RegisteredWorkspaceCommand('2.56.0', 1793827478441)
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

        for (const [
          fieldMetadataId,
          rewrittenOptions,
        ] of optionsToRewriteByFieldMetadataId) {
          await entityManager.query(
            `UPDATE core."fieldMetadata" SET options = $1::jsonb WHERE id = $2 AND "workspaceId" = $3`,
            [JSON.stringify(rewrittenOptions), fieldMetadataId, workspaceId],
          );
        }

        // Rows the new code already created for edited fields are kept as they are.
        const insertedRows: unknown[] =
          optionRowsToInsert.length === 0
            ? []
            : await entityManager.query(
                `INSERT INTO core."fieldMetadataOption"
                  ("workspaceId", "universalIdentifier", "applicationId", "fieldMetadataId", value, label, color, position)
                  SELECT $1, row."universalIdentifier", row."applicationId", row."fieldMetadataId", row.value, row.label, row.color, row.position
                  FROM jsonb_to_recordset($2::jsonb) AS row("universalIdentifier" uuid, "applicationId" uuid, "fieldMetadataId" uuid, value varchar, label varchar, color varchar, position double precision)
                  ON CONFLICT DO NOTHING
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
