import { InjectRepository } from '@nestjs/typeorm';

import { MoreThan, Repository } from 'typeorm';
import { Command, Option } from 'nest-commander';
import { isDefined } from 'twenty-shared/utils';
import { StepStatus, WorkflowRunStepInfos } from 'twenty-shared/workflow';

import {
  ActiveOrSuspendedWorkspacesMigrationCommandRunner,
  RunOnWorkspaceArgs,
} from 'src/database/commands/command-runners/active-or-suspended-workspaces-migration.command-runner';
import { Workspace } from 'src/engine/core-modules/workspace/workspace.entity';
import { TwentyORMGlobalManager } from 'src/engine/twenty-orm/twenty-orm-global.manager';
import {
  WorkflowRunState,
  WorkflowRunOutput,
  WorkflowRunWorkspaceEntity,
} from 'src/modules/workflow/common/standard-objects/workflow-run.workspace-entity';

const DEFAULT_CHUNK_SIZE = 500;

@Command({
  name: 'upgrade:1-1:migrate-workflow-run-state',
  description: 'Migrate state column in workflow run records',
})
export class MigrateWorkflowRunStatesCommand extends ActiveOrSuspendedWorkspacesMigrationCommandRunner {
  private afterDate: string | undefined;
  private chunkSize = DEFAULT_CHUNK_SIZE;

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

  @Option({
    flags: '--chunk-size [chunk_size]',
    description:
      'Split workflowRuns into chunks for each workspaces (default 500)',
    required: false,
  })
  parseChunkSize(val: number): number {
    if (isNaN(val) || val <= 0) {
      throw new Error(`Invalid chunk size: ${val}. Should be greater than 0`);
    }

    this.chunkSize = val;

    return this.chunkSize;
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

    const chunkCount = Math.ceil(workflowRunCount / this.chunkSize);

    this.logger.log(
      `Migrate ${workflowRunCount} workflowRun state in ${chunkCount} chunks of size ${this.chunkSize}`,
    );

    for (let offset = 0; offset < chunkCount; offset += 1) {
      this.logger.log(`- Proceeding chunk ${offset + 1}/${chunkCount}`);

      const findOption = isDefined(this.afterDate)
        ? { where: { startedAt: MoreThan(this.afterDate) } }
        : {};

      const workflowRuns = (await workflowRunRepository.find({
        ...findOption,
        skip: offset * this.chunkSize,
        take: this.chunkSize,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      })) as any[]; // We type as any as workflowRun output has been removed since 1.1.0 release

      for (const workflowRun of workflowRuns) {
        const output = workflowRun.output;

        if (!isDefined(output)) {
          continue;
        }

        const state = this.buildRunStateFromOutput(output);

        await workflowRunRepository.update(workflowRun.id, {
          state,
        });
      }
    }
  }

  private buildRunStateFromOutput(output: WorkflowRunOutput): WorkflowRunState {
    const stepInfos: WorkflowRunStepInfos = Object.fromEntries(
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
