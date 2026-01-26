import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { STANDARD_OBJECT_IDS } from 'twenty-shared/metadata';
import { type FieldMetadataRelationSettings } from 'twenty-shared/types';
import { capitalize } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { type WorkspaceCacheKeyName } from 'src/engine/workspace-cache/types/workspace-cache-key.type';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { ATTACHMENT_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-migration/constant/standard-field-ids';

@Command({
  name: 'upgrade:1-17:migrate-attachment-to-morph-relations',
  description:
    'Migrate attachment relations to morph relation fields and set feature flag',
})
export class MigrateAttachmentToMorphRelationsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
    private readonly twentyORMGlobalManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
    private readonly workspaceCacheStorageService: WorkspaceCacheStorageService,
    private readonly workspaceCacheService: WorkspaceCacheService,
    private readonly workspaceMetadataVersionService: WorkspaceMetadataVersionService,
  ) {
    super(workspaceRepository, twentyORMGlobalManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    const isMigrated = await this.featureFlagService.isFeatureEnabled(
      FeatureFlagKey.IS_ATTACHMENT_MIGRATED,
      workspaceId,
    );

    this.logger.log(`Migrating attachments for workspace ${workspaceId}`);

    if (isMigrated) {
      this.logger.log(`Attachment migration already completed. Skipping...`);

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would have migrated attachments for workspace ${workspaceId}. Skipping...`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const schemaName = getWorkspaceSchemaName(workspaceId);
      const tableName = 'attachment';

      const relatedObjectMetadata = await this.objectMetadataRepository.find({
        where: {
          workspaceId,
        },
      });
      const relatedObjectMetadataMap = new Map(
        relatedObjectMetadata.map((obj) => [obj.id, obj]),
      );

      const attachmentTargetFieldUniversalIdentifiers = new Set<string>([
        ATTACHMENT_STANDARD_FIELD_IDS.targetTask,
        ATTACHMENT_STANDARD_FIELD_IDS.targetNote,
        ATTACHMENT_STANDARD_FIELD_IDS.targetPerson,
        ATTACHMENT_STANDARD_FIELD_IDS.targetCompany,
        ATTACHMENT_STANDARD_FIELD_IDS.targetOpportunity,
        ATTACHMENT_STANDARD_FIELD_IDS.targetDashboard,
        ATTACHMENT_STANDARD_FIELD_IDS.targetWorkflow,
      ]);

      const attachmentObjectMetadata =
        await this.objectMetadataRepository.findOne({
          where: {
            workspaceId,
            universalIdentifier: STANDARD_OBJECT_IDS.attachment,
          },
          relations: ['fields'],
        });

      if (!attachmentObjectMetadata) {
        this.logger.error(
          `🟥 Attachment object metadata not found for workspace ${workspaceId}`,
        );

        return;
      }

      const attachmentTargetRelationFields = attachmentObjectMetadata.fields
        .filter((field) => field.type === 'RELATION')
        .filter((field) => {
          if (!field.relationTargetObjectMetadataId) {
            return false;
          }

          const relatedObject = relatedObjectMetadataMap.get(
            field.relationTargetObjectMetadataId,
          );

          if (!relatedObject) {
            return false;
          }

          const isStandardTarget =
            attachmentTargetFieldUniversalIdentifiers.has(
              field.universalIdentifier,
            );
          const isCustomTarget = relatedObject.isCustom;

          return isStandardTarget || isCustomTarget;
        });

      const fieldMigrations = attachmentTargetRelationFields.flatMap(
        (field) => {
          if (!field.relationTargetObjectMetadataId) {
            return [];
          }

          const relatedObject = relatedObjectMetadataMap.get(
            field.relationTargetObjectMetadataId,
          );

          if (!relatedObject) {
            return [];
          }

          const newFieldName = `target${capitalize(relatedObject.nameSingular)}`;
          const relationSettings =
            field.settings as FieldMetadataRelationSettings | null;
          const oldJoinColumnName =
            relationSettings?.joinColumnName ??
            computeMorphOrRelationFieldJoinColumnName({ name: field.name });
          const newJoinColumnName = computeMorphOrRelationFieldJoinColumnName({
            name: newFieldName,
          });

          return [
            {
              field,
              relatedObject,
              newFieldName,
              oldJoinColumnName,
              newJoinColumnName,
            },
          ];
        },
      );

      for (const { oldJoinColumnName, newJoinColumnName } of fieldMigrations) {
        if (oldJoinColumnName === newJoinColumnName) {
          this.logger.log(
            `Column "${oldJoinColumnName}" already renamed. Skipping...`,
          );
          continue;
        }

        try {
          await queryRunner.query(
            `ALTER TABLE "${schemaName}"."${tableName}"
           RENAME COLUMN "${oldJoinColumnName}" TO "${newJoinColumnName}"`,
          );
          this.logger.log(
            `Renamed column "${oldJoinColumnName}" to "${newJoinColumnName}" for "${tableName}"`,
          );
        } catch (error) {
          this.logger.error(
            `Error renaming column "${oldJoinColumnName}" to "${newJoinColumnName}" for "${tableName}" in workspace ${workspaceId}`,
            error,
          );

          throw error;
        }
      }

      this.logger.log(`✅ Successfully migrated attachment records`);

      const morphId = ATTACHMENT_STANDARD_FIELD_IDS.targetMorphId;

      for (const {
        field: fieldToMigrate,
        relatedObject,
        newFieldName,
        newJoinColumnName,
      } of fieldMigrations) {
        const settings = {
          ...fieldToMigrate.settings,
          joinColumnName: newJoinColumnName,
        };

        try {
          const result = await queryRunner.query(
            `UPDATE core."fieldMetadata"
           SET name = $1, type = 'MORPH_RELATION', "morphId" = $3, settings = $4
           WHERE id = $2`,
            [newFieldName, fieldToMigrate.id, morphId, settings],
          );

          const rowsUpdated = result[1] || 0;

          if (rowsUpdated > 0) {
            this.logger.log(
              `Updated fieldMetadata: ${fieldToMigrate.name} → ${newFieldName} (type: MORPH_RELATION)`,
            );
          }
        } catch (error) {
          this.logger.error(
            `Error updating fieldMetadata for ${relatedObject.nameSingular} in workspace ${workspaceId}`,
            error,
          );

          throw error;
        }
      }

      this.logger.log(`✅ Successfully migrated attachment fieldmetadata`);

      await queryRunner.commitTransaction();

      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_ATTACHMENT_MIGRATED],
        workspaceId,
      );

      const relatedMetadataNames =
        getMetadataRelatedMetadataNames('fieldMetadata');
      const relatedCacheKeysToInvalidate: WorkspaceCacheKeyName[] =
        relatedMetadataNames.map(getMetadataFlatEntityMapsKey);
      const cacheKeysToInvalidate: WorkspaceCacheKeyName[] = [
        'flatFieldMetadataMaps',
        ...relatedCacheKeysToInvalidate,
        'featureFlagsMap',
      ];

      this.logger.log(
        `Invalidating caches: ${cacheKeysToInvalidate.join(' ')}`,
      );

      await this.workspaceCacheService.invalidateAndRecompute(
        workspaceId,
        cacheKeysToInvalidate,
      );

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
      this.logger.log(`Cache flushed`);

      this.logger.log(
        `Set IS_ATTACHMENT_MIGRATED feature flag for workspace ${workspaceId}`,
      );

      this.logger.log(`Flush cache for workspace ${workspaceId}`);
      await this.workspaceCacheStorageService.flush(workspaceId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error migrating attachment to morph relations (rolled transaction back on ${workspaceId})`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
