import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { createMissingIndexes } from 'src/database/commands/upgrade-version-command/2-55/utils/create-missing-indexes.util';
import { findIndexValidityByName } from 'src/database/commands/upgrade-version-command/2-55/utils/find-index-validity-by-name.util';
import { findWorkspaceTableStates } from 'src/database/commands/upgrade-version-command/2-55/utils/find-workspace-table-states.util';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { IS_PRIVATE_COLUMN_NAME } from 'src/engine/permissions/private-record/constants/is-private-column-name.constant';
import { enrichRecordTableSchemaWithIsPrivate } from 'src/engine/permissions/private-record/utils/enrich-record-table-schema-with-is-private.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';


@RegisteredWorkspaceCommand('2.55.0', 1793436309311)
@Command({
  name: 'upgrade:2-55:add-private-record-column',
  description:
    'Add the _isPrivate column and its partial index to every object table except recordShare and accessGroup. Large tables get their index with CONCURRENTLY.',
})
export class AddPrivateRecordColumnCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
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

    const { flatObjectMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
      ]);

    const schemaName = getWorkspaceSchemaName(workspaceId);
    const tableSchemas = Object.values(
      flatObjectMetadataMaps.byUniversalIdentifier,
    )
      .filter(isDefined)
      .map((flatObjectMetadata) => ({
        tableName: getWorkspaceSchemaContextForMigration({
          workspaceId,
          objectMetadata: flatObjectMetadata,
        }).tableName,
        ...enrichRecordTableSchemaWithIsPrivate({
          objectMetadata: flatObjectMetadata,
          tableSchema: { columnDefinitions: [], indexDefinitions: [] },
        }),
      }))
      .filter(({ columnDefinitions }) => columnDefinitions.length > 0);

    const queryRunner = dataSource.createQueryRunner('master');
    let isQueryRunnerConnected = false;
    let dryRunTableCount = 0;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const tableStates = await findWorkspaceTableStates({
        queryRunner,
        schemaName,
        tableNames: tableSchemas.map(({ tableName }) => tableName),
        columnNames: [IS_PRIVATE_COLUMN_NAME],
      });
      const indexValidityByName = await findIndexValidityByName({
        queryRunner,
        schemaName,
        indexNames: tableSchemas.flatMap(({ indexDefinitions }) =>
          indexDefinitions.map(({ name }) => name),
        ),
      });

      for (const {
        tableName,
        columnDefinitions,
        indexDefinitions,
      } of tableSchemas) {
        const tableState = tableStates.get(tableName);

        if (!isDefined(tableState)) {
          continue;
        }

        const missingColumnDefinitions = columnDefinitions.filter(
          ({ name }) => !tableState.existingColumnNames.has(name),
        );
        const missingIndexDefinitions = indexDefinitions.filter(
          ({ name }) => indexValidityByName.get(name) !== true,
        );

        if (
          missingColumnDefinitions.length === 0 &&
          missingIndexDefinitions.length === 0
        ) {
          continue;
        }

        if (options.dryRun) {
          dryRunTableCount++;

          continue;
        }


        await this.workspaceSchemaManagerService.columnManager.addColumns({
          queryRunner,
          schemaName,
          tableName,
          columnDefinitions: missingColumnDefinitions,
        });
        await createMissingIndexes({
          indexManager: this.workspaceSchemaManagerService.indexManager,
          queryRunner,
          schemaName,
          tableName,
          tableSizeInBytes: tableState.sizeInBytes,
          indexDefinitions: missingIndexDefinitions,
          indexValidityByName,
        });
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }

    if (options.dryRun) {
      this.logger.log(
        `[DRY RUN] Would update ${dryRunTableCount} table(s) for workspace ${workspaceId}`,
      );
    }
  }
}
