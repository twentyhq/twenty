import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { applyDiff, isDefined } from 'twenty-shared/utils';
import { type WorkflowVersionStepChanges } from '~/generated/graphql';

export const useApplyWorkflowVersionStepChanges = (instanceId?: string) => {
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);

  const applyWorkflowVersionStepChanges = ({
    workflowVersionStepChanges,
    workflowVersionId,
  }: {
    workflowVersionStepChanges: WorkflowVersionStepChanges | undefined;
    workflowVersionId: string;
  }) => {
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
  };

  return { applyWorkflowVersionStepChanges };
};
