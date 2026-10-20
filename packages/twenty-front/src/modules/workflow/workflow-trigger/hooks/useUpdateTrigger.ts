import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useSaveUnsavedWorkflowFlow } from '@/workflow/hooks/useSaveUnsavedWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowUnsavedFlowKeysComponentState } from '@/workflow/states/workflowUnsavedFlowKeysComponentState';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useUpdateTrigger = (instanceId?: string) => {
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);
  const setWorkflowUnsavedFlowKeys = useSetAtomComponentState(
    workflowUnsavedFlowKeysComponentState,
    instanceId,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);
  const { updateWorkflowVersionTrigger } =
    useUpdateWorkflowVersionTrigger(instanceId);
  const { saveUnsavedWorkflowFlow } = useSaveUnsavedWorkflowFlow(instanceId);

  const writeTriggerToFlow = useCallback(
    (trigger: WorkflowTrigger) => {
      setFlow((currentFlow) =>
        isDefined(currentFlow) ? { ...currentFlow, trigger } : currentFlow,
      );
    },
    [setFlow],
  );

  const updateTrigger = (updatedTrigger: WorkflowTrigger) => {
    writeTriggerToFlow(updatedTrigger);

    setWorkflowUnsavedFlowKeys((unsavedFlowKeys) => [
      ...unsavedFlowKeys.filter((flowKey) => flowKey !== TRIGGER_STEP_ID),
      TRIGGER_STEP_ID,
    ]);
  };

  const updateTriggerNow = async (updatedTrigger: WorkflowTrigger) => {
    await saveUnsavedWorkflowFlow();

    const workflowVersionId = await getUpdatableWorkflowVersion();

    const isSaved = await updateWorkflowVersionTrigger({
      workflowVersionId,
      trigger: updatedTrigger,
    });

    if (isSaved) {
      writeTriggerToFlow(updatedTrigger);
    }

    return isSaved;
  };

  return {
    updateTrigger,
    updateTriggerNow,
  };
};
