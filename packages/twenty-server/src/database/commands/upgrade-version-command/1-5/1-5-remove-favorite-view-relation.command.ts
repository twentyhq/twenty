import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { FieldMetadataType } from 'twenty-shared/types';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { FieldMetadataEntity } from 'src/engine/metadata-modules/field-metadata/field-metadata.entity';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceSchemaManagerService } from 'src/engine/twenty-orm/workspace-schema-manager/workspace-schema-manager.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import {
  FAVORITE_STANDARD_FIELD_IDS,
  VIEW_STANDARD_FIELD_IDS,
} from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { STANDARD_OBJECT_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-object-ids';

@Command({
  name: 'upgrade:1-5:remove-favorite-view-relation',
  description: 'Remove favorite view relation.',
})
export class RemoveFavoriteViewRelationCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    protected readonly workspaceSchemaManager: WorkspaceSchemaManagerService,
    @InjectDataSource()
    protected readonly coreDataSource: DataSource,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const objectMetadataRepository =
        queryRunner.manager.getRepository(ObjectMetadataEntity);

      const fieldMetadataRepository =
        queryRunner.manager.getRepository(FieldMetadataEntity);

      const [favoriteObjectMetadata] = await objectMetadataRepository.find({
        where: {
          standardId: STANDARD_OBJECT_IDS.favorite,
          workspaceId,
        },
      });

      if (!favoriteObjectMetadata) {
        throw new Error('Favorite object metadata not found');
      }

      const [viewObjectMetadata] = await objectMetadataRepository.find({
        where: {
          standardId: STANDARD_OBJECT_IDS.view,
          workspaceId,
        },
      });

      if (!viewObjectMetadata) {
        throw new Error('View object metadata not found');
      }

      const [favoriteViewFieldMetadata] = await fieldMetadataRepository.find({
        where: {
          objectMetadataId: favoriteObjectMetadata.id,
          standardId: FAVORITE_STANDARD_FIELD_IDS.view,
          workspaceId,
        },
      });

      const [viewFavoriteFieldMetadata] = await fieldMetadataRepository.find({
        where: {
          objectMetadataId: viewObjectMetadata.id,
          standardId: VIEW_STANDARD_FIELD_IDS.favorites,
          workspaceId,
        },
      });

      if (!viewFavoriteFieldMetadata || !favoriteViewFieldMetadata) {
        this.logger.warn(
          'View or favorite view field metadata not found or already migrated, skipping...',
        );

        return;
      }

      if (!options.dryRun) {
        await fieldMetadataRepository.delete(viewFavoriteFieldMetadata.id);
        await fieldMetadataRepository.update(favoriteViewFieldMetadata.id, {
          name: 'viewId',
          type: FieldMetadataType.UUID,
          label: 'ViewId',
          description: 'ViewId',
          icon: 'IconView',
          isSystem: true,
          isNullable: true,
          relationTargetFieldMetadataId: null,
          relationTargetObjectMetadataId: null,
          settings: null,
        });
      }

      const workspaceSchemaName = getWorkspaceSchemaName(workspaceId);

      const foreignKeyName =
        queryRunner.connection.namingStrategy.foreignKeyName(
          favoriteObjectMetadata.nameSingular,
          [`${favoriteViewFieldMetadata.name}Id`],
          `${workspaceSchemaName}.${viewObjectMetadata.nameSingular}`,
          [`${viewFavoriteFieldMetadata.name}`],
        );

      if (!options.dryRun) {
        await this.workspaceSchemaManager.foreignKeyManager.dropForeignKey({
          queryRunner,
          schemaName: workspaceSchemaName,
          tableName: favoriteObjectMetadata.nameSingular,
          foreignKeyName,
        });
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );
  }
}
