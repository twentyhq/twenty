import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowPendingFlowKeysComponentState } from '@/workflow/states/workflowPendingFlowKeysComponentState';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { replaceStepInFlow } from '@/workflow/utils/replaceStepInFlow';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateStep = (instanceId?: string) => {
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);
  const setWorkflowPendingFlowKeys = useSetAtomComponentState(
    workflowPendingFlowKeysComponentState,
    instanceId,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);
  const { updateWorkflowVersionStep } =
    useUpdateWorkflowVersionStep(instanceId);
  const { savePendingWorkflowFlow, saveWorkflowFlowEdits } =
    useSavePendingWorkflowFlow(instanceId);

  const writeStepToFlow = useCallback(
    (step: WorkflowAction) => {
      setFlow((currentFlow) => replaceStepInFlow({ flow: currentFlow, step }));
    },
    [setFlow],
  );

  const updateStep = (updatedStep: WorkflowAction) => {
    writeStepToFlow(updatedStep);

    setWorkflowPendingFlowKeys((pendingFlowKeys) => [
      ...pendingFlowKeys.filter((flowKey) => flowKey !== updatedStep.id),
      updatedStep.id,
    ]);

    return saveWorkflowFlowEdits();
  };

  const updateStepNow = async (updatedStep: WorkflowAction) => {
    await savePendingWorkflowFlow();

    const workflowVersionId = await getUpdatableWorkflowVersion();

    const result = await updateWorkflowVersionStep({
      workflowVersionId,
      step: updatedStep,
    });

    const savedStep = result?.data?.updateWorkflowVersionStep;

    if (isDefined(savedStep)) {
      writeStepToFlow(savedStep);
    }

    return { updatedStep: savedStep };
  };

  return {
    updateStep,
    updateStepNow,
  };
};
