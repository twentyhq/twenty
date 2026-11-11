import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowFlowAppliedServerChangesCountComponentState } from '@/workflow/states/workflowFlowAppliedServerChangesCountComponentState';
import { applyDiff, isDefined } from 'twenty-shared/utils';
import { type WorkflowVersionStepChanges } from '~/generated/graphql';

export const useApplyWorkflowVersionStepChanges = (instanceId?: string) => {
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);
  const setWorkflowFlowAppliedServerChangesCount = useSetAtomComponentState(
    workflowFlowAppliedServerChangesCountComponentState,
    instanceId,
  );

  const applyWorkflowVersionStepChanges = ({
    workflowVersionStepChanges,
    workflowVersionId,
  }: {
    workflowVersionStepChanges: WorkflowVersionStepChanges | undefined;
    workflowVersionId: string;
  }): void => {
    if (!isDefined(workflowVersionStepChanges)) {
      return;
    }

    const { triggerDiff, stepsDiff } = workflowVersionStepChanges;

    setFlow((currentFlow) => {
      if (!isDefined(currentFlow)) {
        return currentFlow;
      }

      return {
        workflowVersionId,
        trigger: applyDiff({ trigger: currentFlow.trigger }, triggerDiff)
          .trigger,
        steps: applyDiff({ steps: currentFlow.steps }, stepsDiff).steps,
      };
    });
    setWorkflowFlowAppliedServerChangesCount((count) => count + 1);
  };

  return { applyWorkflowVersionStepChanges };
};
