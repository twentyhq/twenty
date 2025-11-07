import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { DataSource, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { getWorkspaceSchemaName } from 'src/engine/workspace-datasource/utils/get-workspace-schema-name.util';

@Command({
  name: 'upgrade:1-11:migrate-timeline-activity-to-morph-relations',
  description:
    'Migrate timeline activity relations to morph relation fields and set feature flag',
})
export class MigrateTimelineActivityToMorphRelationsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
    private readonly featureFlagService: FeatureFlagService,
    @InjectDataSource()
    private readonly coreDataSource: DataSource,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
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

    const fieldMigrations = [
      { old: 'companyId', new: 'targetCompanyId' },
      { old: 'personId', new: 'targetPersonId' },
      { old: 'opportunityId', new: 'targetOpportunityId' },
      { old: 'noteId', new: 'targetNoteId' },
      { old: 'taskId', new: 'targetTaskId' },
      { old: 'workflowId', new: 'txwargetWorkflowId' },
      { old: 'workflowVersionId', new: 'targetWorkflowVersionId' },
      { old: 'workflowRunId', new: 'targetWorkflowRunId' },
      { old: 'dashboardId', new: 'targetDashboardId' },
    ];

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
