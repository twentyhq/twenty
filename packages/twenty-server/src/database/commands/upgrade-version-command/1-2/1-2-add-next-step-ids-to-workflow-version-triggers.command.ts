import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';
import { isDefined } from 'twenty-shared/utils';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

@Command({
  name: 'upgrade:1-2:add-next-step-ids-to-workflow-version-triggers',
  description: 'Add next step ids to workflow version triggers',
})
export class AddNextStepIdsToWorkflowVersionTriggers extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
        { shouldBypassPermissionChecks: true },
      );

    const workflowVersions = await workflowVersionRepository.find();

    for (const workflowVersion of workflowVersions) {
      try {
        const { trigger, steps } = workflowVersion;

        if (!isDefined(trigger)) {
          this.logger.warn(
            `Undefined trigger for workflowVersion ${workflowVersion.id}`,
          );

          continue;
        }

        if (!isDefined(steps)) {
          this.logger.warn(
            `Undefined steps for workflowVersion ${workflowVersion.id}`,
          );

          continue;
        }

        const rootSteps = this.getRootSteps(steps);

        if (rootSteps.length === 0) {
          this.logger.warn(
            `No root steps found for workflowVersion ${workflowVersion.id}`,
          );

          continue;
        }

        await workflowVersionRepository.update(workflowVersion.id, {
          trigger: {
            ...trigger,
            nextStepIds: rootSteps.map((step) => step.id),
          },
        });
      } catch (error) {
        this.logger.error(
          `Error while adding nextStepIds to workflowVersion ${workflowVersion.id}`,
          error,
        );
      }
    }

    this.logger.log(`${workflowVersions.length} triggers updated`);
  }

  private getRootSteps(steps: WorkflowAction[]): WorkflowAction[] {
    const childIds = new Set<string>();

    for (const step of steps) {
      step.nextStepIds?.forEach((id) => childIds.add(id));
    }

    return steps.filter((step) => !childIds.has(step.id));
  }
}
