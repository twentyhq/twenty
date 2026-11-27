import { Inject } from '@nestjs/common';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { type QueryRunner } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RICH_TEXT_FILE_IDS_COLUMN_NAME_SUFFIX } from 'src/database/commands/upgrade-version-command/2-63/constants/rich-text-file-ids-column-name-suffix.constant';
import { buildAddRichTextFileIdsColumnStatements } from 'src/database/commands/upgrade-version-command/2-63/utils/build-add-rich-text-file-ids-column-statements.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByIdInFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps.util';
import { computeObjectTargetTable } from 'src/engine/utils/compute-object-target-table.util';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@RegisteredWorkspaceCommand('2.63.0', 1795470090382)
@Command({
  name: 'upgrade:2-63:add-rich-text-file-ids-columns',
  description:
    'Add the server-only fileIds column to every rich text field, ahead of the release that reads it',
})
export class AddRichTextFileIdsColumnsCommand extends ProvisionedWorkspaceCommandRunner {
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

    const richTextFields = Object.values(
      flatFieldMetadataMaps.byUniversalIdentifier,
    ).flatMap((flatFieldMetadata) => {
      if (flatFieldMetadata?.type !== FieldMetadataType.RICH_TEXT) {
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
      const provisionedColumnKeys = await this.findProvisionedColumnKeys({
        queryRunner,
        schemaName,
      });
      const richTextFieldsToProvision = richTextFields.filter(
        ({ tableName, fieldName }) =>
          existingTableNames.has(tableName) &&
          !provisionedColumnKeys.has(
            `${tableName}.${fieldName}${RICH_TEXT_FILE_IDS_COLUMN_NAME_SUFFIX}`,
          ),
      );

      this.logger.log(
        `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: adding the fileIds column to ${richTextFieldsToProvision.length} of ${richTextFields.length} rich text field(s)`,
      );

      if (options.dryRun) {
        return;
      }

      const statements = buildAddRichTextFileIdsColumnStatements({
        schemaName,
        richTextFields: richTextFieldsToProvision,
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

  private async findProvisionedColumnKeys({
    queryRunner,
    schemaName,
  }: {
    queryRunner: QueryRunner;
    schemaName: string;
  }): Promise<Set<string>> {
    const columns: { tableName: string; columnName: string }[] =
      await queryRunner.query(
        `SELECT table_name AS "tableName", column_name AS "columnName"
         FROM information_schema.columns
         WHERE table_schema = $1 AND right(column_name, length($2)) = $2`,
        [schemaName, RICH_TEXT_FILE_IDS_COLUMN_NAME_SUFFIX],
      );

    return new Set(
      columns.map(({ tableName, columnName }) => `${tableName}.${columnName}`),
    );
  }
}
