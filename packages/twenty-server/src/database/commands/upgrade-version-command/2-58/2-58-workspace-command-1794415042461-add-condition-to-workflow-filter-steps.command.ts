import { isNonEmptyString, isObject } from '@sniptt/guards';
import { Command } from 'nest-commander';
import {
  type StepFilterGroup,
  type StepFilterWithPotentiallyDeprecatedOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  computeIfElseBranchConditionFromFilter,
  computeWorkflowStepConditionFromFilter,
  type StepIfElseBranch,
} from 'twenty-shared/workflow';

import { ProvisionedWorkspaceCommandRunner } from 'src/database/commands/command-runners/provisioned-workspace.command-runner';
import { WorkspaceIteratorService } from 'src/database/commands/command-runners/workspace-iterator.service';
import { type RunOnWorkspaceArgs } from 'src/database/commands/command-runners/workspace.command-runner';
import { rewriteJsonbRowsWithCompareAndSet } from 'src/database/commands/upgrade-version-command/2-56/utils/rewrite-jsonb-rows-with-compare-and-set.util';
import { RegisteredWorkspaceCommand } from 'src/engine/core-modules/upgrade/decorators/registered-workspace-command.decorator';
import { WorkspaceCacheService } from 'src/engine/workspace-cache/services/workspace-cache.service';

type StoredStepInput = {
  condition?: unknown;
  stepFilterGroups?: StepFilterGroup[];
  stepFilters?: StepFilterWithPotentiallyDeprecatedOperand[];
  branches?: StepIfElseBranch[];
};

type StoredStep = {
  type?: unknown;
  settings?: { input?: StoredStepInput };
};

@RegisteredWorkspaceCommand('2.58.0', 1794415042461)
@Command({
  name: 'upgrade:2-58:add-condition-to-workflow-filter-steps',
  description:
    'Give workflow Filter steps and If/Else branches the condition expression of their filter, when it gives the same result. The filter is kept for the visual editor.',
})
export class AddConditionToWorkflowFilterStepsCommand extends ProvisionedWorkspaceCommandRunner {
  constructor(
    protected readonly workspaceIteratorService: WorkspaceIteratorService,
    private readonly workspaceCacheService: WorkspaceCacheService,
  ) {
    super(workspaceIteratorService);
  }

  override async runOnWorkspace({
    workspaceId,
    options,
    dataSource,
  }: RunOnWorkspaceArgs): Promise<void> {
    if (!isDefined(dataSource)) {
      this.logger.warn(
        `No data source for workspace ${workspaceId}, skipping step condition conversion`,
      );

      return;
    }

    const isDryRun = options.dryRun ?? false;
    let keptFilterCount = 0;

    const addFilterStepCondition = (input: StoredStepInput): StoredStepInput => {
      if (isNonEmptyString(input.condition)) {
        return input;
      }

      const condition = computeWorkflowStepConditionFromFilter(input);

      if (!isDefined(condition)) {
        keptFilterCount += input.stepFilters?.length ? 1 : 0;

        return input;
      }

      return { ...input, condition };
    };

    const addBranchConditions = (input: StoredStepInput): StoredStepInput => {
      if (!Array.isArray(input.branches)) {
        return input;
      }

      const branches = input.branches.map((branch) => {
        if (
          !isObject(branch) ||
          !isDefined(branch.filterGroupId) ||
          isNonEmptyString(branch.condition)
        ) {
          return branch;
        }

        const condition = computeIfElseBranchConditionFromFilter({
          branch,
          stepFilterGroups: input.stepFilterGroups ?? [],
          stepFilters: input.stepFilters ?? [],
        });

        if (!isDefined(condition)) {
          keptFilterCount += 1;

          return branch;
        }

        return { ...branch, condition };
      });

      return branches.some((branch, index) => branch !== input.branches?.[index])
        ? { ...input, branches }
        : input;
    };

    const addCondition = (step: StoredStep): StoredStep => {
      const input = step.settings?.input;

      if (!isObject(input)) {
        return step;
      }

      const nextInput =
        step.type === 'FILTER'
          ? addFilterStepCondition(input)
          : step.type === 'IF_ELSE'
            ? addBranchConditions(input)
            : input;

      return nextInput === input
        ? step
        : { ...step, settings: { ...step.settings, input: nextInput } };
    };

    const rewrittenVersionCount = await rewriteJsonbRowsWithCompareAndSet<
      StoredStep[] | null
    >({
      dataSource,
      isDryRun,
      tableName: 'core."workflowVersion"',
      columnName: 'steps',
      whereClause: `"workspaceId" = $1 AND (steps::text LIKE '%"FILTER"%' OR steps::text LIKE '%"IF_ELSE"%') AND steps::text LIKE '%stepFilters%'`,
      whereParameters: [workspaceId],
      mapRow: ({ value }) => {
        if (!Array.isArray(value)) {
          return { value, hasChanged: false };
        }

        const steps = value.map(addCondition);

        return {
          value: steps,
          hasChanged: steps.some((step, index) => step !== value[index]),
        };
      },
    });

    if (!isDryRun) {
      await this.workspaceCacheService.invalidateAndRecompute(workspaceId, [
        'flatWorkflowVersionMaps',
      ]);
    }

    if (rewrittenVersionCount + keptFilterCount === 0) {
      return;
    }

    this.logger.log(
      `${isDryRun ? '[DRY RUN] ' : ''}Workspace ${workspaceId}: added conditions to the steps of ${rewrittenVersionCount} workflow version(s); ${keptFilterCount} step or branch filter(s) have no exact expression and keep the legacy filter`,
    );
  }
}
