import { useSetAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useSetAtomComponentState';
import { useGetUpdatableWorkflowVersionOrThrow } from '@/workflow/hooks/useGetUpdatableWorkflowVersionOrThrow';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { flowComponentState } from '@/workflow/states/flowComponentState';
import { workflowPendingFlowKeysComponentState } from '@/workflow/states/workflowPendingFlowKeysComponentState';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { useUpdateWorkflowVersionTrigger } from '@/workflow/workflow-trigger/hooks/useUpdateWorkflowVersionTrigger';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { TRIGGER_STEP_ID } from 'twenty-shared/workflow';

export const useUpdateTrigger = (instanceId?: string) => {
  const setFlow = useSetAtomComponentState(flowComponentState, instanceId);
  const setWorkflowPendingFlowKeys = useSetAtomComponentState(
    workflowPendingFlowKeysComponentState,
    instanceId,
  );

  const { getUpdatableWorkflowVersion } =
    useGetUpdatableWorkflowVersionOrThrow(instanceId);
  const { updateWorkflowVersionTrigger } =
    useUpdateWorkflowVersionTrigger(instanceId);
  const { savePendingWorkflowFlow, saveWorkflowFlowEdits } =
    useSavePendingWorkflowFlow(instanceId);

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

    setWorkflowPendingFlowKeys((pendingFlowKeys) => [
      ...pendingFlowKeys.filter((flowKey) => flowKey !== TRIGGER_STEP_ID),
      TRIGGER_STEP_ID,
    ]);

    return saveWorkflowFlowEdits();
  };

  const updateTriggerNow = async (updatedTrigger: WorkflowTrigger) => {
    await savePendingWorkflowFlow();

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
