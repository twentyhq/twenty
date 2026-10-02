import { InjectDataSource } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER } from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';
import { DataSource } from 'typeorm';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import {
  type RecordShareIndexToCreate,
  buildRecordShareIndexSyncPlanOrThrow,
} from 'src/database/commands/upgrade-version-command/2-45/utils/build-record-share-index-sync-plan-or-throw.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { findFlatEntityByUniversalIdentifier } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-universal-identifier.util';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { WorkspaceMigrationBuilderException } from 'src/engine/workspace-manager/workspace-migration/exceptions/workspace-migration-builder-exception';
import { WorkspaceMigrationValidateBuildAndRunService } from 'src/engine/workspace-manager/workspace-migration/services/workspace-migration-validate-build-and-run-service';
import { getWorkspaceSchemaContextForMigration } from 'src/engine/workspace-manager/workspace-migration/workspace-migration-runner/utils/get-workspace-schema-context-for-migration.util';

// The standard application is only synchronized when a workspace is created,
// so existing workspaces keep the single-column principalId and sourceId
// indexes. New indexes are built CONCURRENTLY outside the migration
// transaction first, so a large recordShare table is not write-locked for the
// whole build; the migration then finds them through IF NOT EXISTS.
@RegisteredWorkspaceCommand('2.45.0', 1790924660152)
@Command({
  name: 'upgrade:2-45:index-record-share-grants-by-principal-and-object',
  description:
    'Replace the recordShare principalId and sourceId indexes with a (principalId, objectMetadataId) index serving the read gate',
})
export class IndexRecordShareGrantsByPrincipalAndObjectCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMigrationValidateBuildAndRunService: WorkspaceMigrationValidateBuildAndRunService,
    private readonly workspaceSchemaManagerService: WorkspaceSchemaManagerService,
    @InjectDataSource() private readonly dataSource: DataSource,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace(args: RunOnWorkspaceArgs): Promise<void> {
    await this.up(args);
  }

  async up(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncRecordShareIndexes(args, 'up');
  }

  async down(args: RunOnWorkspaceArgs): Promise<void> {
    await this.syncRecordShareIndexes(args, 'down');
  }

  private async syncRecordShareIndexes(
    { workspaceId, options }: RunOnWorkspaceArgs,
    direction: 'up' | 'down',
  ): Promise<void> {
    const { flatObjectMetadataMaps, flatFieldMetadataMaps, flatIndexMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);

    const recordShareFlatObjectMetadata =
      findFlatEntityByUniversalIdentifier<FlatObjectMetadata>({
        flatEntityMaps: flatObjectMetadataMaps,
        universalIdentifier: STANDARD_OBJECTS.recordShare.universalIdentifier,
      });

    if (!isDefined(recordShareFlatObjectMetadata)) {
      this.logger.log(
        `recordShare object not found for workspace ${workspaceId}, skipping`,
      );

      return;
    }

    const { indexesToCreate, indexesToDelete } = buildRecordShareIndexSyncPlanOrThrow(
      {
        recordShareFlatObjectMetadata,
        flatFieldMetadataMaps,
        flatIndexMaps,
        direction,
        now: new Date().toISOString(),
      },
    );

    if (indexesToCreate.length === 0 && indexesToDelete.length === 0) {
      return;
    }

    this.logger.log(
      `${options.dryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: creating recordShare index(es) [${indexesToCreate
        .map(({ universalFlatIndexMetadata }) => universalFlatIndexMetadata.name)
        .join(', ')}] and dropping [${indexesToDelete
        .map(({ name }) => name)
        .join(', ')}]`,
    );

    if (options.dryRun) {
      return;
    }

    await this.createIndexesConcurrently({
      workspaceId,
      recordShareFlatObjectMetadata,
      indexesToCreate,
    });

    const result =
      await this.workspaceMigrationValidateBuildAndRunService.validateBuildAndRunLegacyWorkspaceMigration(
        {
          workspaceId,
          isSystemBuild: true,
          applicationUniversalIdentifier:
            TWENTY_STANDARD_APPLICATION_UNIVERSAL_IDENTIFIER,
          allFlatEntityOperationByMetadataName: {
            index: {
              flatEntityToCreate: indexesToCreate.map(
                ({ universalFlatIndexMetadata }) => universalFlatIndexMetadata,
              ),
              flatEntityToDelete: indexesToDelete,
              flatEntityToUpdate: [],
            },
          },
        },
      );

    if (result.status === 'fail') {
      this.logger.error(
        `Failed to sync recordShare indexes for workspace ${workspaceId}:\n${JSON.stringify(result, null, 2)}`,
      );
      throw new WorkspaceMigrationBuilderException(result);
    }
  }

  private async createIndexesConcurrently({
    workspaceId,
    recordShareFlatObjectMetadata,
    indexesToCreate,
  }: {
    workspaceId: string;
    recordShareFlatObjectMetadata: FlatObjectMetadata;
    indexesToCreate: RecordShareIndexToCreate[];
  }): Promise<void> {
    if (indexesToCreate.length === 0) {
      return;
    }

    const { schemaName, tableName } = getWorkspaceSchemaContextForMigration({
      workspaceId,
      objectMetadata: recordShareFlatObjectMetadata,
    });
    const queryRunner = this.dataSource.createQueryRunner();
    let isQueryRunnerConnected = false;

    try {
      await queryRunner.connect();
      isQueryRunnerConnected = true;

      // An interrupted concurrent build leaves an invalid index behind,
      // which IF NOT EXISTS would keep and the migration would register
      const invalidIndexes: { name: string }[] = await queryRunner.query(
        `SELECT c.relname AS name
         FROM pg_index i
         JOIN pg_class c ON c.oid = i.indexrelid
         JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = $1 AND c.relname = ANY($2) AND NOT i.indisvalid`,
        [
          schemaName,
          indexesToCreate.map(
            ({ universalFlatIndexMetadata }) => universalFlatIndexMetadata.name,
          ),
        ],
      );

      for (const { name: indexName } of invalidIndexes) {
        await this.workspaceSchemaManagerService.indexManager.dropIndex({
          queryRunner,
          schemaName,
          indexName,
          concurrently: true,
        });

        this.logger.warn(
          `Dropped invalid index ${indexName} left by an interrupted build in workspace ${workspaceId}, recreating it`,
        );
      }

      for (const { universalFlatIndexMetadata, columnNames } of indexesToCreate) {
        await this.workspaceSchemaManagerService.indexManager.createIndex({
          queryRunner,
          schemaName,
          tableName,
          index: {
            name: universalFlatIndexMetadata.name,
            columns: columnNames,
            isUnique: universalFlatIndexMetadata.isUnique,
            type: universalFlatIndexMetadata.indexType,
          },
          concurrently: true,
        });
      }
    } finally {
      if (isQueryRunnerConnected) {
        await queryRunner.release();
      }
    }
  }
}
