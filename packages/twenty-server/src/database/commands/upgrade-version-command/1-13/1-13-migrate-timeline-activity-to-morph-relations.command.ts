import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { capitalize } from 'twenty-shared/utils';
import { DataSource, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { computeMorphOrRelationFieldJoinColumnName } from 'src/engine/metadata-modules/field-metadata/utils/compute-morph-or-relation-field-join-column-name.util';
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { TIMELINE_ACTIVITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';
import { buildTimelineActivityRelatedMorphFieldMetadataName } from 'src/modules/timeline/utils/timeline-activity-related-morph-field-metadata-name-builder.util';

@Command({
  name: 'upgrade:1-13:migrate-timeline-activity-to-morph-relations',
  description:
    'Migrate timeline activity relations to morph relation fields and set feature flag',
})
export class MigrateTimelineActivityToMorphRelationsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
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
      FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED,
      workspaceId,
    );

    this.logger.log(`Migrating timelineActivity for workspace ${workspaceId}`);

    if (isMigrated) {
      this.logger.log(
        `Timeline activity migration already completed. Skipping...`,
      );

      return;
    }

    if (options.dryRun) {
      this.logger.log(
        `Would have migrated timeline activities for workspace ${workspaceId}. Skipping...`,
      );

      return;
    }

    const queryRunner = this.coreDataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const schemaName = getWorkspaceSchemaName(workspaceId);
      const tableName = 'timelineActivity';

      const customObjectMetadata = await this.objectMetadataRepository.find({
        where: {
          workspaceId,
          isCustom: true,
        },
      });
      const customObjectMetadataNames = customObjectMetadata.map(
        (objectMetadata) => objectMetadata.nameSingular,
      );

      const fieldNameMigrations = [
        { old: 'company', new: 'targetCompany' },
        { old: 'person', new: 'targetPerson' },
        { old: 'opportunity', new: 'targetOpportunity' },
        { old: 'note', new: 'targetNote' },
        { old: 'task', new: 'targetTask' },
        { old: 'workflow', new: 'targetWorkflow' },
        { old: 'workflowVersion', new: 'targetWorkflowVersion' },
        { old: 'workflowRun', new: 'targetWorkflowRun' },
        { old: 'dashboard', new: 'targetDashboard' },
        ...customObjectMetadataNames.map((customObjectName) => ({
          old: `${customObjectName}`,
          new: `target${capitalize(customObjectName)}`,
        })),
      ];

      const fieldMigrations = fieldNameMigrations.map(
        ({ old: oldFieldName, new: newFieldName }) => ({
          old: `${oldFieldName}Id`,
          new: `${newFieldName}Id`,
        }),
      );

      const timelineActivityObjectMetadata =
        await this.objectMetadataRepository.findOne({
          where: {
            workspaceId,
            nameSingular: 'timelineActivity',
          },
          relations: ['fields'],
        });

      if (!timelineActivityObjectMetadata) {
        this.logger.error(
          `🟥 Timeline activity object metadata not found for workspace ${workspaceId}`,
        );

        return;
      }

      for (const { new: newField, old: oldField } of fieldMigrations) {
        try {
          await queryRunner.query(
            `ALTER TABLE "${schemaName}"."${tableName}"
           RENAME COLUMN "${oldField}" TO "${newField}"`,
          );
          this.logger.log(
            `Renamed column "${oldField}" to "${newField}" for "${tableName}"`,
          );
        } catch (error) {
          this.logger.error(
            `Error renaming column "${oldField}" to "${newField}" for "${tableName}" in workspace ${workspaceId}`,
            error,
          );

          throw error;
        }
      }

      this.logger.log(`✅ Successfully migrated timeline activity records`);

      const objectNamesToMigrate = fieldNameMigrations.map(
        ({ old: oldFieldName }) => oldFieldName,
      );

      const relatedObjectMetadata = await this.objectMetadataRepository.find({
        where: {
          workspaceId,
        },
      });

      const relatedObjectMetadataMap = new Map(
        relatedObjectMetadata.map((obj) => [obj.nameSingular, obj]),
      );

      const morphId = TIMELINE_ACTIVITY_STANDARD_FIELD_IDS.targetMorphId;

      for (const objectName of objectNamesToMigrate) {
        const relatedObject = relatedObjectMetadataMap.get(objectName);

        if (!relatedObject) {
          this.logger.warn(
            `Related object metadata not found for ${objectName} in workspace ${workspaceId}`,
          );
          continue;
        }

        const fieldToMigrate = timelineActivityObjectMetadata.fields.find(
          (field) =>
            field.type === 'RELATION' &&
            field.relationTargetObjectMetadataId === relatedObject.id,
        );

        if (!fieldToMigrate) {
          this.logger.log(
            `No RELATION field found for ${objectName} in timelineActivity`,
          );
          continue;
        }

        const newFieldName = buildTimelineActivityRelatedMorphFieldMetadataName(
          fieldToMigrate.name,
        );

        const settings = {
          ...fieldToMigrate.settings,
          joinColumnName: computeMorphOrRelationFieldJoinColumnName({
            name: newFieldName,
          }),
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
            `Error updating fieldMetadata for ${objectName} in workspace ${workspaceId}`,
            error,
          );

          throw error;
        }
      }

      this.logger.log(
        `✅ Successfully migrated timeline activity fieldmetadata`,
      );

      await queryRunner.commitTransaction();

      await this.featureFlagService.enableFeatureFlags(
        [FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED],
        workspaceId,
      );

      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatFieldMetadataMaps',
        'flatObjectMetadataMaps',
        'featureFlagsMap',
      ]);

      await this.workspaceMetadataVersionService.incrementMetadataVersion(
        workspaceId,
      );
      this.logger.log(`Cache flushed`);

      this.logger.log(
        `Set IS_TIMELINE_ACTIVITY_MIGRATED feature flag for workspace ${workspaceId}`,
      );

      this.logger.log(`Flush cache for workspace ${workspaceId}`);
      await this.workspaceCacheStorageService.flush(workspaceId);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(
        `Error migrating timeline activity to morph relations (rolled transaction back on ${workspaceId})`,
        error,
      );
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
