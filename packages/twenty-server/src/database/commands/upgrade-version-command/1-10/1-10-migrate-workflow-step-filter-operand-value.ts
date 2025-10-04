import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { convertViewFilterOperandToCoreOperand } from 'twenty-shared/utils';
import { Raw, Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  type RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';

@Command({
  name: 'upgrade:1-10:migrate-workflow-step-filter-operand-value',
  description:
    'Migrate workflowVersion.steps[].settings.input.stepFilters[].operand to use new operand enum',
})
export class MigrateWorkflowStepFilterOperandValueCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace)
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
    index,
    total,
    options,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `[${index + 1}/${total}] Migrating workflow step filter operand values for workspace ${workspaceId}`,
    );

    // workflowVersions
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersionsToMigrate = await workflowVersionRepository.find({
      where: [
        {
          steps: Raw(
            (_alias) => `"workflowVersion"."steps"::text LIKE :search`,
            {
              search: '%operand%',
            },
          ),
        },
      ],
    });

    this.logger.log(
      `Found ${workflowVersionsToMigrate.length} workflowVersions to migrate`,
    );

    for (const workflowVersion of workflowVersionsToMigrate) {
      let steps: unknown;

      try {
        steps =
          typeof workflowVersion.steps === 'string'
            ? JSON.parse(workflowVersion.steps)
            : workflowVersion.steps;
      } catch (error) {
        this.logger.warn(
          `Could not parse steps for workflowVersion ${workflowVersion.id} in workspace ${workspaceId}: ${error.message}`,
        );
        continue;
      }

      if (!Array.isArray(steps)) {
        continue;
      }

      let hasChanged = false;

      for (const step of steps) {
        if (
          step?.settings?.input?.stepFilters &&
          Array.isArray(step.settings.input.stepFilters)
        ) {
          for (const filter of step.settings.input.stepFilters) {
            if (typeof filter.operand === 'string') {
              const newOperand = convertViewFilterOperandToCoreOperand(
                filter.operand,
              );

              if (newOperand && newOperand !== filter.operand) {
                filter.operand = newOperand;
                hasChanged = true;
              }
            }
          }
        }
      }

      if (hasChanged) {
        if (options.dryRun) {
          this.logger.log(
            `DRY RUN - Would update workflowVersion ${workflowVersion.id} in workspace ${workspaceId}.`,
          );
        } else {
          this.logger.log(
            `Updating workflowVersion ${workflowVersion.id} in workspace ${workspaceId}`,
          );

          await workflowVersionRepository.update(
            { id: workflowVersion.id },
            { steps: JSON.stringify(steps) as unknown as () => string },
          );
        }

        this.logger.log(
          `Updated workflowVersion ${workflowVersion.id} in workspace ${workspaceId}`,
        );
      }
    }

    //workflowRuns
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );

    const workflowRunsToMigrate = await workflowRunRepository.find({
      where: [
        {
          state: Raw((_alias) => `"workflowRun"."state"::text LIKE :search`, {
            search: '%operand%',
          }),
        },
      ],
    });

    this.logger.log(
      `Found ${workflowRunsToMigrate.length} workflowRuns to migrate`,
    );

    for (const workflowRun of workflowRunsToMigrate) {
      let state: unknown;

      try {
        state =
          typeof workflowRun.state === 'string'
            ? JSON.parse(workflowRun.state)
            : workflowRun.state;
      } catch (error) {
        this.logger.warn(
          `Could not parse state for workflowRun ${workflowRun.id} in workspace ${workspaceId}: ${error.message}`,
        );
        continue;
      }

      if (!Array.isArray(state)) {
        continue;
      }

      let hasChanged = false;

      for (const stateDetails of state) {
        if (
          stateDetails?.settings?.input?.stepFilters &&
          Array.isArray(stateDetails.settings.input.stepFilters)
        ) {
          for (const filter of stateDetails.settings.input.stepFilters) {
            if (typeof filter.operand === 'string') {
              const newOperand = convertViewFilterOperandToCoreOperand(
                filter.operand,
              );

              if (newOperand && newOperand !== filter.operand) {
                filter.operand = newOperand;
                hasChanged = true;
              }
            }
          }
        }
      }

      if (hasChanged) {
        if (options.dryRun) {
          this.logger.log(
            `Would update workflowRun ${workflowRun.id} in workspace ${workspaceId}.`,
          );
        } else {
          this.logger.log(
            `Updating workflowRun ${workflowRun.id} in workspace ${workspaceId}`,
          );

          await workflowRunRepository.update(
            { id: workflowRun.id },
            { state: JSON.stringify(state) as unknown as () => string },
          );
        }

        this.logger.log(
          `Updated workflowRun ${workflowRun.id} in workspace ${workspaceId}`,
        );
      }
    }
  }
}
