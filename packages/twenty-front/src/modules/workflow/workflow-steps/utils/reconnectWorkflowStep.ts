import { type WorkflowAction } from '@/workflow/types/Workflow';
import { type WorkflowStepConnectionOptions } from '@/workflow/workflow-diagram/types/WorkflowStepConnectionOptions';
import { getReconnectedStepIds } from '@/workflow/workflow-steps/utils/getReconnectedStepIds';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

export const reconnectWorkflowStep = ({
  step,
  oldTargetId,
  newTargetId,
  connectionOptions,
}: {
  step: WorkflowAction;
  oldTargetId: string;
  newTargetId: string;
  connectionOptions?: WorkflowStepConnectionOptions;
}): WorkflowAction | undefined => {
  const reconnectStepIds = (nextStepIds: string[] | null | undefined) =>
    getReconnectedStepIds({ nextStepIds, oldTargetId, newTargetId });

  if (step.id === newTargetId) {
    return undefined;
  }

  if (connectionOptions?.connectedStepType === 'IF_ELSE') {
    if (step.type !== 'IF_ELSE') {
      return undefined;
    }

    const branchId = connectionOptions.settings.branchId;
    const branch = step.settings.input.branches.find(
      (branch) => branch.id === branchId,
    );
    const nextStepIds = reconnectStepIds(branch?.nextStepIds);

    if (!isDefined(nextStepIds)) {
      return undefined;
    }

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          branches: step.settings.input.branches.map((branch) =>
            branch.id === branchId ? { ...branch, nextStepIds } : branch,
          ),
        },
      },
    };
  }

  if (
    connectionOptions?.connectedStepType === 'ITERATOR' &&
    connectionOptions.settings.isConnectedToLoop
  ) {
    if (step.type !== 'ITERATOR') {
      return undefined;
    }

    const initialLoopStepIds = step.settings.input.initialLoopStepIds;
    const normalizedInitialLoopStepIds = isNonEmptyString(initialLoopStepIds)
      ? [initialLoopStepIds]
      : initialLoopStepIds;
    const reconnectedInitialLoopStepIds = reconnectStepIds(
      normalizedInitialLoopStepIds,
    );

    if (!isDefined(reconnectedInitialLoopStepIds)) {
      return undefined;
    }

    return {
      ...step,
      settings: {
        ...step.settings,
        input: {
          ...step.settings.input,
          initialLoopStepIds: reconnectedInitialLoopStepIds,
        },
      },
    };
  }

  if (step.type === 'IF_ELSE') {
    return undefined;
  }

  const nextStepIds = reconnectStepIds(step.nextStepIds);

  return isDefined(nextStepIds) ? { ...step, nextStepIds } : undefined;
};
