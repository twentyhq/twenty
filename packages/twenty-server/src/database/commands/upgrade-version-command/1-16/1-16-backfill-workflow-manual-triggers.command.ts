import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { In, Raw, Repository } from 'typeorm';

import { ActiveOrSuspendedWorkspacesMigrationCommandRunner } from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspaces-migration.command-runner';
import { WorkspaceEntity } from 'src/engine/core-modules/workspace/workspace.entity';
import { DataSourceService } from 'src/engine/metadata-modules/data-source/data-source.service';
import { GlobalWorkspaceOrmManager } from 'src/engine/twenty-orm/global-workspace-datasource/global-workspace-orm.manager';
import { buildSystemAuthContext } from 'src/engine/twenty-orm/utils/build-system-auth-context.util';
import { type WorkflowManualTriggerWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-manual-trigger.workspace-entity';
import {
  WorkflowVersionStatus,
  type WorkflowVersionWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { assertWorkflowVersionTriggerIsDefined } from 'src/modules/workflow/common/utils/assert-workflow-version-trigger-is-defined.util';

@Command({
  name: 'upgrade:1-16:backfill-workflow-manual-triggers',
  description:
    'Backfill WorkflowManualTrigger entities from active WorkflowVersions with MANUAL trigger type',
})
export class BackfillWorkflowManualTriggersCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(WorkspaceEntity)
    protected readonly workspaceRepository: Repository<WorkspaceEntity>,
    protected readonly globalWorkspaceOrmManager: GlobalWorkspaceOrmManager,
    protected readonly dataSourceService: DataSourceService,
  ) {
    super(workspaceRepository, globalWorkspaceOrmManager, dataSourceService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Starting backfill of WorkflowManualTrigger entities for workspace ${workspaceId}`,
    );

    const authContext = buildSystemAuthContext(workspaceId);

    await this.globalWorkspaceOrmManager.executeInWorkspaceContext(
      authContext,
      async () => {
        const workflowVersionRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowVersionWorkspaceEntity>(
            workspaceId,
            'workflowVersion',
            { shouldBypassPermissionChecks: true },
          );

        const workflowManualTriggerRepository =
          await this.globalWorkspaceOrmManager.getRepository<WorkflowManualTriggerWorkspaceEntity>(
            workspaceId,
            'workflowManualTrigger',
            { shouldBypassPermissionChecks: true },
          );

        const manualTriggerVersions = await workflowVersionRepository.find({
          where: {
            status: WorkflowVersionStatus.ACTIVE,
            trigger: Raw(
              () => `"workflowVersion"."trigger"->>'type' = 'MANUAL'`,
            ),
          },
        });

        this.logger.log(
          `Found ${manualTriggerVersions.length} active workflow versions with MANUAL trigger type`,
        );

        if (manualTriggerVersions.length === 0) {
          this.logger.log(
            `No active workflow versions with MANUAL trigger type found for workspace ${workspaceId}`,
          );

          return;
        }

        const workflowVersionIds = manualTriggerVersions.map(
          (version) => version.id,
        );

        const existingManualTriggers =
          await workflowManualTriggerRepository.find({
            where: {
              workflowVersionId: In(workflowVersionIds),
            },
            select: ['workflowVersionId'],
          });

        const existingWorkflowVersionIds = new Set(
          existingManualTriggers.map((trigger) => trigger.workflowVersionId),
        );

        const versionsToCreate = manualTriggerVersions.filter(
          (version) => !existingWorkflowVersionIds.has(version.id),
        );

        const skippedCount =
          manualTriggerVersions.length - versionsToCreate.length;

        if (skippedCount > 0) {
          this.logger.log(
            `Found ${skippedCount} workflow versions that already have ManualTrigger entities, skipping`,
          );
        }

        if (versionsToCreate.length === 0) {
          this.logger.log(
            `All workflow versions already have ManualTrigger entities for workspace ${workspaceId}`,
          );

          return;
        }

        if (options.dryRun) {
          this.logger.log(
            `[DRY RUN] Would create ${versionsToCreate.length} ManualTrigger entities`,
          );

          for (const workflowVersion of versionsToCreate) {
            assertWorkflowVersionTriggerIsDefined(workflowVersion);

            this.logger.log(
              `[DRY RUN] Would create ManualTrigger for workflow version ${workflowVersion.id} (workflow ${workflowVersion.workflowId})`,
            );
          }

          return;
        }

        const manualTriggersToInsert = versionsToCreate.map(
          (workflowVersion) => {
            assertWorkflowVersionTriggerIsDefined(workflowVersion);

            return {
              workflowId: workflowVersion.workflowId,
              workflowVersionId: workflowVersion.id,
              settings: workflowVersion.trigger.settings,
            };
          },
        );

        await workflowManualTriggerRepository.insert(manualTriggersToInsert);

        this.logger.log(
          `Created ${manualTriggersToInsert.length} ManualTrigger entities`,
        );

        this.logger.log(
          `Backfill completed: ${manualTriggersToInsert.length} created, ${skippedCount} skipped`,
        );
      },
    );
  }
}
