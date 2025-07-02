import { InjectRepository } from '@nestjs/typeorm';

import { MoreThan, Repository } from 'typeorm';
import { Command, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunContext,
  WorkflowRunOutput,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';
import {
  StepStatus,
  WorkflowRunStepInfo,
} from 'src/modules/workflow/workflow-executor/types/workflow-run-step-info.type';

@Command({
  name: 'upgrade:1-1:migrate-run-context-to-workflow-run',
  description: 'Populate runContext column in workflow run records',
})
export class MigrateRunContextToWorkflowRunCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private afterDate: string | undefined;

  constructor(
    @InjectRepository(Workspace, 'core')
    protected readonly workspaceRepository: Repository<Workspace>,
    protected readonly twentyORMGlobalManager: TwentyORMGlobalManager,
  ) {
    super(workspaceRepository, twentyORMGlobalManager);
  }

  @Option({
    flags: '--after-date [after_date]',
    description: 'Only select records after this date (YYYY-MM-DD).',
    required: false,
  })
  parseAfterDate(val: string): string | undefined {
    const date = new Date(val);

    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date format: ${val}`);
    }

    const afterDate = date.toISOString();

    this.afterDate = afterDate;

    return afterDate;
  }

  override async runOnWorkspace({
    workspaceId,
  }: RunOnWorkspaceArgs): Promise<void> {
    const workflowRunRepository =
      await this.twentyORMGlobalManager.getRepositoryForWorkspace<WorkflowRunWorkspaceEntity>(
        workspaceId,
        'workflowRun',
        { shouldBypassPermissionChecks: true },
      );

    const workflowRunCount = await workflowRunRepository.count();

    const CHUNK_SIZE = 500;

    const chunkCount = Math.ceil(workflowRunCount / CHUNK_SIZE);

    this.logger.log(
      `Migrate ${workflowRunCount} workflowRun runContext in ${chunkCount} chunks`,
    );

    for (let offset = 0; offset < workflowRunCount; offset += CHUNK_SIZE) {
      this.logger.log(
        `- Proceeding chunk ${offset / CHUNK_SIZE + 1}/${chunkCount}`,
      );

      const findOption = isDefined(this.afterDate)
        ? { where: { startedAt: MoreThan(this.afterDate) } }
        : {};

      const workflowRuns = await workflowRunRepository.find({
        ...findOption,
        skip: offset,
        take: CHUNK_SIZE,
      });

      for (const workflowRun of workflowRuns) {
        const output = workflowRun.output;

        if (!isDefined(output)) {
          continue;
        }

        const runContext = this.getStepInfosFromOutput(output);

        await workflowRunRepository.update(workflowRun.id, { runContext });
      }
    }
  }

  private getStepInfosFromOutput(
    output: WorkflowRunOutput,
  ): WorkflowRunContext {
    const stepInfos: Record<string, WorkflowRunStepInfo> = Object.fromEntries(
      output.flow.steps.map((step) => {
        const stepOutput = output.stepsOutput?.[step.id];
        const status = stepOutput?.pendingEvent
          ? StepStatus.PENDING
          : stepOutput?.error
            ? StepStatus.FAILED
            : stepOutput?.result
              ? StepStatus.SUCCESS
              : StepStatus.NOT_STARTED;

        return [
          step.id,
          {
            result: stepOutput?.result,
            error: stepOutput?.error,
            status,
          },
        ];
      }),
    );

    stepInfos['trigger'] = {
      result: output?.stepsOutput?.trigger?.result,
      status: StepStatus.SUCCESS,
    };

    return {
      flow: output?.flow,
      workflowRunError: output?.error,
      stepInfos,
    };
  }
}
