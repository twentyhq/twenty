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
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

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

    for (const customObjectName of customObjectMetadataNames) {
      const newColumn = `target${capitalize(customObjectName)}Id`;

      try {
        await this.coreDataSource.query(
          `ALTER TABLE "${schemaName}"."${tableName}"
           ADD COLUMN IF NOT EXISTS "${newColumn}" uuid NULL`,
        );
        this.logger.log(
          `Created column "${newColumn}" for custom object "${customObjectName}"`,
        );
      } catch (error) {
        this.logger.error(
          `Error creating column "${newColumn}" for custom object "${customObjectName}" in workspace ${workspaceId}`,
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

    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED],
      workspaceId,
    );

    this.logger.log(
      `Set IS_TIMELINE_ACTIVITY_MIGRATED feature flag for workspace ${workspaceId}`,
    );
  }
}
