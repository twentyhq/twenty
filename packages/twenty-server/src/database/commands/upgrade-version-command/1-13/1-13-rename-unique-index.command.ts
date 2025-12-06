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
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-13:rename-unique-index',
  description:
    'Rename unique indexes to include UNIQUE in their name if missing',
})
export class RenameUniqueIndexCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  protected readonly logger = new Logger(RenameUniqueIndexCommand.name);

  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    @InjectRepository(IndexMetadataEntity)
    private readonly indexMetadataRepository: Repository<IndexMetadataEntity>,
    protected readonly dataSourceService: DataSourceService,
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

    const uniqueIndexes = await this.indexMetadataRepository.find({
      where: {
        workspaceId,
        isUnique: true,
      },
      relations: ['objectMetadata', 'indexFieldMetadatas.fieldMetadata'],
    });

    for (const indexMetadata of uniqueIndexes) {
      if (indexMetadata.name.includes('UNIQUE')) {
        this.logger.log(
          `Index ${indexMetadata.name} already contains UNIQUE in name, skipping`,
        );
        continue;
      }

      const newIndexName = generateDeterministicIndexNameV2({
        flatObjectMetadata: {
          nameSingular: indexMetadata.objectMetadata.nameSingular,
          isCustom: indexMetadata.objectMetadata.isCustom,
        },
        relatedFieldNames: indexMetadata.indexFieldMetadatas.map(
          (indexFieldMetadata) => ({
            name: indexFieldMetadata.fieldMetadata.name,
          }),
        ),
        isUnique: true,
      });

      this.logger.log(
        `Renaming index ${indexMetadata.name} to ${newIndexName}`,
      );

      if (!isDryRun) {
        await this.renameIndexOnDatabase(
          dataSource,
          schemaName,
          indexMetadata.name,
          newIndexName,
        );

        await this.indexMetadataRepository.update(indexMetadata.id, {
          name: newIndexName,
        });
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
