import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RICH_TEXT_FILE_IDS_COLUMN_NAME_SUFFIX } from 'src/database/commands/upgrade-version-command/2-65/constants/rich-text-file-ids-column-name-suffix.constant';
import { buildProvisionRichTextFilesColumnStatements } from 'src/database/commands/upgrade-version-command/2-65/utils/build-provision-rich-text-files-column-statements.util';
import { findRichTextFilesColumnNameConflicts } from 'src/database/commands/upgrade-version-command/2-65/utils/find-rich-text-files-column-name-conflicts.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import {
  FieldMetadataException,
  FieldMetadataExceptionCode,
} from 'src/engine/metadata-modules/field-metadata/field-metadata.exception';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.65.0', 1795701054812)
@Command({
  name: 'upgrade:2-65:provision-rich-text-files-columns',
  description:
    'Add the files column to every rich text field, ahead of the release that declares the sub-field, and drop the unused fileIds column',
})
export class ProvisionRichTextFilesColumnsCommand extends ProvisionedWorkspaceCommandRunner {
  @Inject(WorkspaceCacheService)
  private readonly workspaceCacheService: WorkspaceCacheService;

  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    dataSource,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.log(`No data source for workspace ${workspaceId}, skipping`);

      return;
    }

    const { flatFieldMetadataMaps, flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
      ]);

    const flatFieldMetadatas = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).filter(isDefined);

    const conflicts = findRichTextFilesColumnNameConflicts(flatFieldMetadatas);

    if (conflicts.length > 0) {
      throw new FieldMetadataException(
        `Workspace ${workspaceId}: rename the field(s) ${conflicts.map(({ conflictingFieldId }) => conflictingFieldId).join(', ')}, whose name is the files column of a rich text field of the same object`,
        FieldMetadataExceptionCode.NOT_AVAILABLE,
      );
    }

    const richTextFields = flatFieldMetadatas.flatMap((flatFieldMetadata) => {
      if (flatFieldMetadata.type !== FieldMetadataType.RICH_TEXT) {
        return [];
      }

      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMaps({
        flatEntityId: flatFieldMetadata.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      if (!isDefined(flatObjectMetadata)) {
        this.logger.warn(
          `Workspace ${workspaceId}: skipping rich text field ${flatFieldMetadata.id}, its object ${flatFieldMetadata.objectMetadataId} is missing`,
        );

        return [];
      }

      return [
        {
          tableName: computeObjectTargetTable(flatObjectMetadata),
          fieldName: flatFieldMetadata.name,
        },
      ];
    });

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const queryRunner = dataSource.createQueryRunner('master');
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const existingTableNames = await this.findTableNames({
        queryRunner,
        schemaName,
      });
      const richTextFieldsToProvision = richTextFields.filter(({ tableName }) =>
        existingTableNames.has(tableName),
      );

      const fileIdsColumns = await this.findFileIdsColumns({
        queryRunner,
        schemaName,
      });

      this.logger.log(
        `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding the files column to ${richTextFieldsToProvision.length} rich text field(s) and dropping ${fileIdsColumns.length} fileIds column(s)`,
      );

      if (options.dryRun) {
        return;
      }

      const statements = buildProvisionRichTextFilesColumnStatements({
        schemaName,
        richTextFields: richTextFieldsToProvision,
        fileIdsColumns,
      });

      // Metadata-only, but the exclusive lock must not queue every query on the table
      await queryRunner.query(`SET lock_timeout = '8s'`);

      try {
        for (const statement of statements) {
          await queryRunner.query(statement);
        }
      } finally {
        await queryRunner.query('RESET lock_timeout');
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }
  }

  private async findTableNames({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Set<string>> {
    const tables: { tableName: string }[] = await queryRunner.query(
      `SELECT table_name AS "tableName" FROM information_schema.tables WHERE table_schema = $1`,
      [schemaName],
    );

    return new Set(tables.map(({ tableName }) => tableName));
  }

  // A field name has no underscore, so only the columns the 2.63 command added end this way.
  private async findFileIdsColumns({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<{ tableName: string; columnName: string }[]> {
    return queryRunner.query(
      `SELECT table_name AS "tableName", column_name AS "columnName"
       FROM information_schema.columns
       WHERE table_schema = $1 AND right(column_name, length($2)) = $2`,
      [schemaName, RICH_TEXT_FILE_IDS_COLUMN_NAME_SUFFIX],
    );
  }
}
