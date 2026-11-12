import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource } from 'typeorm';
import { v4 } from 'uuid';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  computeFieldMetadataOptionRowsAlignment,
  type EnumFieldToAlign,
  type ExistingFieldMetadataOptionRow,
} from 'src/database/commands/upgrade-version-command/2-59/utils/compute-field-metadata-option-rows-alignment.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { withDerivedFieldMetadataMaps } from 'src/engine/metadata-modules/flat-entity/utils/with-derived-field-metadata-maps.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

@RegisteredWorkspaceCommand('2.59.0', 1794522024289)
@Command({
  name: 'upgrade:2-59:align-field-metadata-option-rows-with-stored-options',
  description:
    'Bring the option rows of every select field in line with fieldMetadata.options, before options are read from the rows.',
})
export class AlignFieldMetadataOptionRowsWithStoredOptionsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const { optionRowsToInsert, optionRowsToUpdate, optionRowIdsToDelete } =
      await this.coreDataSource.transaction(async (entityManager) => {
        const enumFields: EnumFieldToAlign[] = await entityManager.query(
          `SELECT id, "applicationId", options FROM core."fieldMetadata"
            WHERE "workspaceId" = $1 AND type IN ('SELECT', 'MULTI_SELECT', 'RATING')
            FOR UPDATE`,
          [workspaceId],
        );
        const existingOptionRows: ExistingFieldMetadataOptionRow[] =
          await entityManager.query(
            `SELECT id, "universalIdentifier", "fieldMetadataId", value, label, color, position
              FROM core."fieldMetadataOption" WHERE "workspaceId" = $1 FOR UPDATE`,
            [workspaceId],
          );

        const alignment = computeFieldMetadataOptionRowsAlignment({
          enumFields,
          existingOptionRows,
          generateUniversalIdentifier: v4,
        });

        if (isDryRun) {
          return alignment;
        }

        if (alignment.optionRowIdsToDelete.length > 0) {
          await entityManager.query(
            `DELETE FROM core."fieldMetadataOption"
              WHERE "workspaceId" = $1 AND id = ANY($2::uuid[])`,
            [workspaceId, alignment.optionRowIdsToDelete],
          );
        }

        if (alignment.optionRowsToUpdate.length > 0) {
          await entityManager.query(
            `UPDATE core."fieldMetadataOption" AS option
              SET value = target.value, label = target.label, color = target.color,
                position = target.position, "updatedAt" = now()
              FROM jsonb_to_recordset($2::jsonb)
                AS target(id uuid, value text, label text, color text, position double precision)
              WHERE option."workspaceId" = $1 AND option.id = target.id`,
            [workspaceId, JSON.stringify(alignment.optionRowsToUpdate)],
          );
        }

        if (alignment.optionRowsToInsert.length > 0) {
          await entityManager.query(
            `INSERT INTO core."fieldMetadataOption"
                ("workspaceId", "universalIdentifier", "fieldMetadataId", "applicationId",
                  value, label, color, position)
              SELECT $1, target."universalIdentifier", target."fieldMetadataId", target."applicationId",
                target.value, target.label, target.color, target.position
              FROM jsonb_to_recordset($2::jsonb)
                AS target("universalIdentifier" uuid, "fieldMetadataId" uuid, "applicationId" uuid,
                  value text, label text, color text, position double precision)`,
            [workspaceId, JSON.stringify(alignment.optionRowsToInsert)],
          );
        }

        return alignment;
      });

    const changedRowCount =
      optionRowsToInsert.length +
      optionRowsToUpdate.length +
      optionRowIdsToDelete.length;

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: ${optionRowsToInsert.length} option row(s) inserted, ${optionRowsToUpdate.length} updated, ${optionRowIdsToDelete.length} deleted`,
    );

    if (isDryRun || changedRowCount === 0) {
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
