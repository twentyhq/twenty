import { Logger } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { findFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { findManyFlatEntityByIdInFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-id-in-flat-entity-maps-or-throw.util';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { generateFlatIndexMetadataWithNameOrThrow } from 'src/engine/metadata-modules/index-metadata/utils/generate-flat-index.util';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-13:rename-index-name',
  description: 'Rename indexes to use the new v2 index name format',
})
export class RenameIndexNameCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(RenameIndexNameCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly workspaceCacheService: WorkspaceCacheService,
    protected readonly dataSourceService: DataSourceService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isDryRun = options.dryRun || false;

    if (!isDefined(dataSource)) {
      throw new Error(
        `Could not find data source for workspace ${workspaceId}, should never occur`,
      );
    }

    const schemaName = getWorkspaceSchemaName(workspaceId);

    if (isDryRun) {
      this.logger.log('Dry run mode: No changes will be applied');
    }

    const { flatIndexMaps, flatObjectMetadataMaps, flatFieldMetadataMaps } =
      await this.workspaceCacheService.getOrRecompute(workspaceId, [
        'flatIndexMaps',
        'flatObjectMetadataMaps',
        'flatFieldMetadataMaps',
      ]);

    const indexMetadataByName = new Map(
      Object.values(flatIndexMaps.byId)
        .filter(isDefined)
        .map((index) => [index.name, index]),
    );

    let hasIndexNameChanges = false;
    let hasRemovedIndexMetadata = false;

    for (const index of Object.values(flatIndexMaps.byId).filter(isDefined)) {
      const flatObjectMetadata = findFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityId: index.objectMetadataId,
        flatEntityMaps: flatObjectMetadataMaps,
      });

      const flatFieldMetadatas = findManyFlatEntityByIdInFlatEntityMapsOrThrow({
        flatEntityIds: flatObjectMetadata.fieldMetadataIds,
        flatEntityMaps: flatFieldMetadataMaps,
      });

      const { name: indexNameV2 } = generateFlatIndexMetadataWithNameOrThrow({
        flatObjectMetadata,
        objectFlatFieldMetadatas: flatFieldMetadatas,
        flatIndex: index,
      });

      if (indexNameV2 === index.name) {
        this.logger.log(`Index ${index.name} is V2`);
        continue;
      }

      // Check if another metadata entry already has the v2 name
      const existingV2Metadata = indexMetadataByName.get(indexNameV2);

      if (isDefined(existingV2Metadata) && existingV2Metadata.id !== index.id) {
        // V2 metadata already exists, this v1 metadata is stale
        this.logger.log(
          `Index metadata with v2 name ${indexNameV2} already exists, removing stale v1 metadata and index ${index.name}`,
        );

        if (!isDryRun) {
          const queryRunner = this.coreDataSource.createQueryRunner();

          await queryRunner.connect();
          await queryRunner.startTransaction();

          try {
            await queryRunner.manager.delete(IndexMetadataEntity, index.id);
            await queryRunner.query(
              `DROP INDEX IF EXISTS "${schemaName}"."${index.name}"`,
            );
            await queryRunner.commitTransaction();
            hasRemovedIndexMetadata = true;
          } catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
          } finally {
            await queryRunner.release();
          }
        }
        continue;
      }

      this.logger.log(`Renaming index ${index.name} to ${indexNameV2}`);

      if (isDryRun) {
        continue;
      }

      const queryRunner = this.coreDataSource.createQueryRunner();

      await queryRunner.connect();
      await queryRunner.startTransaction();

      try {
        await queryRunner.query(
          `ALTER INDEX "${schemaName}"."${index.name}" RENAME TO "${indexNameV2}"`,
        );

        await queryRunner.manager.update(IndexMetadataEntity, index.id, {
          name: indexNameV2,
        });

        await queryRunner.commitTransaction();
        hasIndexNameChanges = true;
      } catch (error) {
        await queryRunner.rollbackTransaction();

        // PostgreSQL error codes for non-existent index:
        // - 42704: undefined_object
        // - 42P01: undefined_table (index treated as relation)
        if (error.code === '42704' || error.code === '42P01') {
          this.logger.log(
            `Index ${index.name} does not exist in schema ${schemaName}, removing metadata`,
          );

          await this.coreDataSource.manager.delete(
            IndexMetadataEntity,
            index.id,
          );
          hasRemovedIndexMetadata = true;
        } else if (error.code === '42P07') {
          // PostgreSQL error code 42P07: duplicate_table (v2 index already exists)
          // The v2 index already exists, remove stale v1 metadata and index
          this.logger.log(
            `Index ${indexNameV2} already exists at PG level, removing stale v1 metadata and index ${index.name}`,
          );

          await this.coreDataSource.manager.delete(
            IndexMetadataEntity,
            index.id,
          );

          await this.coreDataSource.query(
            `DROP INDEX IF EXISTS "${schemaName}"."${index.name}"`,
          );

          hasRemovedIndexMetadata = true;
        } else {
          this.logger.error(
            `Failed to rename index ${index.name}, error code: ${error.code}`,
          );
          throw error;
        }
      } finally {
        await queryRunner.release();
      }
    }

    const shouldInvalidateCache =
      hasIndexNameChanges || hasRemovedIndexMetadata;

    if (shouldInvalidateCache) {
      this.logger.log('Invalidating workspace cache');

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatIndexMaps',
      ]);
    }
  }
}
