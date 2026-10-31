import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import { createMissingIndexes } from 'src/database/commands/upgrade-version-command/2-55/utils/create-missing-indexes.util';
import { findIndexValidityByName } from 'src/database/commands/upgrade-version-command/2-55/utils/find-index-validity-by-name.util';
import { findWorkspaceTableStates } from 'src/database/commands/upgrade-version-command/2-55/utils/find-workspace-table-states.util';
import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { enrichAccessGroupTableSchema } from 'src/engine/metadata-modules/access-group/utils/enrich-access-group-table-schema.util';
import { enrichRecordTableSchemaWithAccessGroupIds } from 'src/engine/metadata-modules/access-group/utils/enrich-record-table-schema-with-access-group-ids.util';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';


@RegisteredWorkspaceCommand('2.55.0', 1793391296027)
@Command({
  name: 'upgrade:2-55:add-access-group-storage-columns',
  description:
    'Add the access group ids column to every object table except recordShare and accessGroup and the compact id to accessGroup. Large tables get their indexes with CONCURRENTLY.',
})
export class AddAccessGroupStorageColumnsCommand extends ProvisionedWorkspaceCommandRunner {
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
        ...enrichRecordTableSchemaWithAccessGroupIds({
          objectMetadata: flatObjectMetadata,
          tableSchema: enrichAccessGroupTableSchema({
            objectMetadata: flatObjectMetadata,
            tableSchema: { columnDefinitions: [], indexDefinitions: [] },
          }),
        }),
      }))
      .filter(({ columnDefinitions }) => columnDefinitions.length > 0);

    const queryRunner = dataSource.createQueryRunner('master');
    let isQueryRunnerConnected = false;
    let dryRunColumnCount = 0;
    let dryRunIndexCount = 0;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      const tableStates = await findWorkspaceTableStates({
        queryRunner,
        schemaName,
        tableNames: tableSchemas.map(({ tableName }) => tableName),
        columnNames: tableSchemas.flatMap(({ columnDefinitions }) =>
          columnDefinitions.map(({ name }) => name),
        ),
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

        if (options.dryRun) {
          dryRunColumnCount += missingColumnDefinitions.length;
          dryRunIndexCount += missingIndexDefinitions.length;

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
        `[DRY RUN] Would add ${dryRunColumnCount} column(s) and ${dryRunIndexCount} index(es) for workspace ${workspaceId}`,
      );
    }
  }
}
