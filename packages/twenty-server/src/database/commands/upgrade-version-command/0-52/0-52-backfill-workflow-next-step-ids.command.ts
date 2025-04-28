import { InjectRepository } from '@nestjs/typeorm';

import { Command } from 'nest-commander';
import { Repository } from 'typeorm';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import { WorkflowRunWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import { WorkflowVersionWorkspaceEntity } from 'src/modules/workflow/common/standard-objects/workflow-version.workspace-entity';
import { WorkflowTrigger } from 'src/modules/workflow/workflow-trigger/types/workflow-trigger.type';

@Command({
  name: 'upgrade:0-52:backfill-workflow-next-step-ids',
  description: 'Backfill workflow next step ids',
})
export class BackfillWorkflowNextStepIdsCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  override async runOnWorkspace({
    index,
    total,
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    this.logger.log(
      `Running command for workspace ${workspaceId} ${index + 1}/${total}`,
    );

    const workflowVersionRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowVersionWorkspaceEntity>(
        workspaceId,
        'workflowVersion',
      );

    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
      );

    const workflowVersions = await workflowVersionRepository.find();

    this.logger.log(`Number of workflow versions: ${workflowVersions.length}`);

    for (const workflowVersion of workflowVersions) {
      this.logger.log(`Processing workflow version: ${workflowVersion.id}`);
      const updatedSteps: WorkflowVersionWorkspaceEntity['steps'] = [];
      const workflowSteps = workflowVersion.steps;

      if (!workflowSteps) {
        continue;
      }

      // for each step, add the next step id which is the next index
      for (let stepIndex = 0; stepIndex < workflowSteps.length; stepIndex++) {
        const updatedStep = {
          ...workflowSteps[stepIndex],
          nextStepIds:
            stepIndex < workflowSteps.length - 1 &&
            workflowSteps[stepIndex + 1]?.id
              ? [workflowSteps[stepIndex + 1].id]
              : undefined,
        };

        updatedSteps.push(updatedStep);
      }

      // update workflow run flows by batch of 500
      const batchSize = 500;
      const totalWorkflowRuns = await workflowRunRepository.count({
        where: {
          workflowVersionId: workflowVersion.id,
        },
      });

      const totalBatches = Math.ceil(totalWorkflowRuns / batchSize);

      this.logger.log(`Total batches: ${totalBatches}`);

      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const updatedWorkflowRuns: WorkflowRunWorkspaceEntity[] = [];

        this.logger.log(`Processing batch ${batchIndex + 1}/${totalBatches}`);
        const workflowRuns = await workflowRunRepository.find({
          where: {
            workflowVersionId: workflowVersion.id,
          },
          take: batchSize,
          skip: batchIndex * batchSize,
        });

        for (const workflowRun of workflowRuns) {
          const flow = workflowRun.output?.flow;

          if (!flow?.steps || flow.steps.length < 2) {
            continue;
          }

          const updatedFlow = flow.steps.map((step) => {
            const updatedStep = updatedSteps.find((s) => s.id === step.id);

            return {
              ...step,
              nextStepIds: updatedStep?.nextStepIds,
            };
          });

          const updatedWorkflowRun: WorkflowRunWorkspaceEntity = {
            ...workflowRun,
            output: {
              ...workflowRun.output,
              flow: {
                trigger: workflowRun.output?.flow?.trigger as WorkflowTrigger,
                steps: updatedFlow,
              },
            },
          };

          updatedWorkflowRuns.push(updatedWorkflowRun);
        }

        await workflowRunRepository.save(updatedWorkflowRuns);
      }

      await workflowVersionRepository.save({
        ...workflowVersion,
        steps: updatedSteps,
      });

      this.logger.log(
        `Updated workflow version ${workflowVersion.id} for workspace ${workspaceId}`,
      );
    }
  }
}
