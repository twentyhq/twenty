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
import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { WorkspaceMetadataVersionService } from 'src/engine/metadata-modules/workspace-metadata-version/services/workspace-metadata-version.service';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkspaceCacheStorageService } from 'src/engine/workspace-cache-storage/workspace-cache-storage.service';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';
import { TIMELINE_ACTIVITY_STANDARD_FIELD_IDS } from 'src/engine/workspace-manager/workspace-sync-metadata/constants/standard-field-ids';

@Command({
  name: 'upgrade:1-13:migrate-timeline-activity-to-morph-relations',
  description:
    'Migrate timeline activity relations to morph relation fields and set feature flag',
})
export class MigrateTimelineActivityToMorphRelationsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly featureFlagService: FeatureFlagService,
    @InjectRepository(ObjectMetadataEntity)
    private readonly objectMetadataRepository: Repository<ObjectMetadataEntity>,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
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

    const fieldMigrations = [
      { old: 'companyId', new: 'targetCompanyId' },
      { old: 'personId', new: 'targetPersonId' },
      { old: 'opportunityId', new: 'targetOpportunityId' },
      { old: 'noteId', new: 'targetNoteId' },
      { old: 'taskId', new: 'targetTaskId' },
      { old: 'workflowId', new: 'targetWorkflowId' },
      { old: 'workflowVersionId', new: 'targetWorkflowVersionId' },
      { old: 'workflowRunId', new: 'targetWorkflowRunId' },
      { old: 'dashboardId', new: 'targetDashboardId' },
      ...customObjectMetadataNames.map((customObjectName) => ({
        old: `${customObjectName}Id`,
        new: `target${capitalize(customObjectName)}Id`,
      })),
    ];

    for (const { new: newField } of fieldMigrations) {
      try {
        await this.coreDataSource.query(
          `ALTER TABLE "${schemaName}"."${tableName}"
           ADD COLUMN IF NOT EXISTS "${newField}" uuid NULL`,
        );
        this.logger.log(
          `Created column "${newField}" for custom object "${tableName}"`,
        );
      } catch (error) {
        this.logger.error(
          `Error creating column "${newField}" for custom object "${tableName}" in workspace ${workspaceId}`,
          error,
        );

        return;
      }
    }

    for (const { old: oldField, new: newField } of fieldMigrations) {
      try {
        const result = await this.coreDataSource.query(
          `UPDATE "${schemaName}"."${tableName}"
           SET "${newField}" = "${oldField}"
           WHERE "${oldField}" IS NOT NULL
             AND "${newField}" IS NULL`,
        );

        const rowsUpdated = result[1] || 0;

        if (rowsUpdated > 0) {
          this.logger.log(
            `Migrated ${rowsUpdated} records for ${oldField} → ${newField}`,
          );
        }
      } catch (error) {
        this.logger.error(
          `Error migrating ${oldField} → ${newField} for workspace ${workspaceId}`,
          error,
        );

        return;
      }
    }

    this.logger.log(`✅ Successfully migrated timeline activity records`);

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

    const objectNamesToMigrate = fieldMigrations.map(({ old }) =>
      old.replace(/Id$/, ''),
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

      const newFieldName = `target${capitalize(fieldToMigrate.name)}`;

      const settings = {
        ...fieldToMigrate.settings,
        joinColumnName: `${newFieldName}Id`,
      };

      try {
        const result = await this.coreDataSource.query(
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

        return;
      }
    }

    this.logger.log(`✅ Successfully migrated timeline activity fieldmetadata`);

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED],
      workspaceId,
    );

    await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
      // 'ORMEntityMetadatas',
      // 'flatFieldMetadataMaps',
      // 'flatObjectMetadataMaps',
    ]);

    await this.workspaceMetadataVersionService.incrementMetadataVersion(
      workspaceId,
    );

    this.logger.log(
      `Set IS_TIMELINE_ACTIVITY_MIGRATED feature flag for workspace ${workspaceId}`,
    );

    this.logger.log(`Flush cache for workspace ${workspaceId}`);
    await this.workspaceCacheStorageService.flush(workspaceId);
  }
}
