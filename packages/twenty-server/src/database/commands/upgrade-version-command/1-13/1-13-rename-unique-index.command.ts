import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { IndexMetadataEntity } from 'src/engine/metadata-modules/index-metadata/index-metadata.entity';
import { generateDeterministicIndexNameV2 } from 'src/engine/metadata-modules/index-metadata/utils/generate-deterministic-index-name-v2';
import { WorkspaceDataSource } from 'src/engine/twenty-orm/datasource/workspace.datasource';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
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
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    protected readonly dataSourceService: DataSourceService,
    protected readonly workspaceCacheService: WorkspaceCacheService,
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

    const indexes = await this.indexMetadataRepository.find({
      where: {
        workspaceId,
      },
      relations: ['objectMetadata', 'indexFieldMetadatas.fieldMetadata'],
    });

    let hasIndexNameChanges = false;

    for (const index of indexes) {
      const indexNameV2 = generateDeterministicIndexNameV2({
        flatObjectMetadata: {
          nameSingular: index.objectMetadata.nameSingular,
          isCustom: index.objectMetadata.isCustom,
        },
        relatedFieldNames: index.indexFieldMetadatas.map(
          (indexFieldMetadata) => ({
            name: indexFieldMetadata.fieldMetadata.name,
          }),
        ),
        isUnique: index.isUnique,
      });

      if (indexNameV2 === index.name) {
        this.logger.log(`Index ${index.name} is V2`);
        continue;
      } else {
        this.logger.log(`Renaming index ${index.name} to ${indexNameV2}`);
        hasIndexNameChanges = true;
        if (!isDryRun) {
          await this.renameIndexOnDatabase(
            dataSource,
            schemaName,
            index.name,
            indexNameV2,
          );

          await this.indexMetadataRepository.update(index.id, {
            name: indexNameV2,
          });
        }
      }
    }
    if (hasIndexNameChanges) {
      this.logger.log('Invalidating workspace cache');

      if (!isDryRun) {
        await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
          'flatFieldMetadataMaps',
          'flatIndexMaps',
        ]);
      }
    }
  }

  private async renameIndexOnDatabase(
    dataSource: WorkspaceDataSource,
    schemaName: string,
    oldIndexName: string,
    newIndexName: string,
  ): Promise<void> {
    await dataSource.query(
      `ALTER INDEX "${schemaName}"."${oldIndexName}" RENAME TO "${newIndexName}"`,
      [],
      undefined,
      { shouldBypassPermissionChecks: true },
    );
  }
}
