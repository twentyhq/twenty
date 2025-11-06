import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { FeatureFlagKey } from 'src/engine/core-modules/feature-flag/enums/feature-flag-key.enum';
import { FeatureFlagService } from 'src/engine/core-modules/feature-flag/services/feature-flag.service';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { type TimelineActivityWorkspaceEntity } from 'src/modules/timeline/standard-objects/timeline-activity.workspace-entity';

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

    this.logger.log(
      `Migrating timeline activity relations to morph relations for workspace ${workspaceId}`,
    );

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

    const timelineActivityRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<TimelineActivityWorkspaceEntity>(
        workspaceId,
        'timelineActivity',
      );

    const timelineActivities = await timelineActivityRepository.find({
      select: [
        'id',
        'companyId',
        'personId',
        'opportunityId',
        'noteId',
        'taskId',
        'workflowId',
        'workflowVersionId',
        'workflowRunId',
        'dashboardId',
        'timelineActivityCompanyId',
        'timelineActivityPersonId',
        'timelineActivityOpportunityId',
        'timelineActivityNoteId',
        'timelineActivityTaskId',
        'timelineActivityWorkflowId',
        'timelineActivityWorkflowVersionId',
        'timelineActivityWorkflowRunId',
        'timelineActivityDashboardId',
      ],
    });

    this.logger.log(
      `Found ${timelineActivities.length} timeline activities to process`,
    );

    let migratedCount = 0;

    for (const timelineActivity of timelineActivities) {
      const updates: Partial<TimelineActivityWorkspaceEntity> = {};

      if (
        isDefined(timelineActivity.companyId) &&
        !isDefined(timelineActivity.timelineActivityCompanyId)
      ) {
        updates.timelineActivityCompanyId = timelineActivity.companyId;
      }

      if (
        isDefined(timelineActivity.personId) &&
        !isDefined(timelineActivity.timelineActivityPersonId)
      ) {
        updates.timelineActivityPersonId = timelineActivity.personId;
      }

      if (
        isDefined(timelineActivity.opportunityId) &&
        !isDefined(timelineActivity.timelineActivityOpportunityId)
      ) {
        updates.timelineActivityOpportunityId = timelineActivity.opportunityId;
      }

      if (
        isDefined(timelineActivity.noteId) &&
        !isDefined(timelineActivity.timelineActivityNoteId)
      ) {
        updates.timelineActivityNoteId = timelineActivity.noteId;
      }

      if (
        isDefined(timelineActivity.taskId) &&
        !isDefined(timelineActivity.timelineActivityTaskId)
      ) {
        updates.timelineActivityTaskId = timelineActivity.taskId;
      }

      if (
        isDefined(timelineActivity.workflowId) &&
        !isDefined(timelineActivity.timelineActivityWorkflowId)
      ) {
        updates.timelineActivityWorkflowId = timelineActivity.workflowId;
      }

      if (
        isDefined(timelineActivity.workflowVersionId) &&
        !isDefined(timelineActivity.timelineActivityWorkflowVersionId)
      ) {
        updates.timelineActivityWorkflowVersionId =
          timelineActivity.workflowVersionId;
      }

      if (
        isDefined(timelineActivity.workflowRunId) &&
        !isDefined(timelineActivity.timelineActivityWorkflowRunId)
      ) {
        updates.timelineActivityWorkflowRunId = timelineActivity.workflowRunId;
      }

      if (
        isDefined(timelineActivity.dashboardId) &&
        !isDefined(timelineActivity.timelineActivityDashboardId)
      ) {
        updates.timelineActivityDashboardId = timelineActivity.dashboardId;
      }

      if (Object.keys(updates).length > 0) {
        await timelineActivityRepository.update(
          { id: timelineActivity.id },
          updates,
        );
        migratedCount++;
      }
    }

    this.logger.log(
      `Successfully migrated ${migratedCount} timeline activities for workspace ${workspaceId}`,
    );

    // Set the feature flag to indicate migration is complete
    await this.featureFlagService.enableFeatureFlags(
      [FeatureFlagKey.IS_TIMELINE_ACTIVITY_MIGRATED],
      workspaceId,
    );

    this.logger.log(
      `Set IS_TIMELINE_ACTIVITY_MIGRATED feature flag for workspace ${workspaceId}`,
    );
  }
}
