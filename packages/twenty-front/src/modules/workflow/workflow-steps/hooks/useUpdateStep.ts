import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useSaveUnsavedWorkflowFlow } from '@/workflow/hooks/useSaveUnsavedWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowUnsavedFlowKeysComponentState } from '@/workflow/states/workflowUnsavedFlowKeysComponentState';
import { type WorkflowAction } from '@/workflow/types/Workflow';
import { replaceStepInFlow } from '@/workflow/utils/replaceStepInFlow';
import { useUpdateWorkflowVersionStep } from '@/workflow/workflow-steps/hooks/useUpdateWorkflowVersionStep';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useUpdateStep = (instanceId?: string) => {
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);
  const setWorkflowUnsavedFlowKeys = useSetAtomComponentState(
    workflowUnsavedFlowKeysComponentState,
    instanceId,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);
  const { updateWorkflowVersionStep } =
    useUpdateWorkflowVersionStep(instanceId);
  const { saveUnsavedWorkflowFlow } = useSaveUnsavedWorkflowFlow(instanceId);

  const writeStepToFlow = useCallback(
    (step: WorkflowAction) => {
      setFlow((currentFlow) => replaceStepInFlow({ flow: currentFlow, step }));
    },
    [setFlow],
  );

  const updateStep = (updatedStep: WorkflowAction) => {
    writeStepToFlow(updatedStep);

    setWorkflowUnsavedFlowKeys((unsavedFlowKeys) => [
      ...unsavedFlowKeys.filter((flowKey) => flowKey !== updatedStep.id),
      updatedStep.id,
    ]);
  };

  const updateStepNow = async (updatedStep: WorkflowAction) => {
    await saveUnsavedWorkflowFlow();

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
