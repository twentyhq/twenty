import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSavePendingWorkflowFlow } from '@/workflow/hooks/useSavePendingWorkflowFlow';
import { workflowPendingFlowKeysComponentState } from '@/workflow/states/workflowPendingFlowKeysComponentState';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const WORKFLOW_FLOW_SAVE_DEBOUNCE_IN_MS = 500;

export const WorkflowFlowSaveEffect = () => {
  const workflowPendingFlowKeys = useAtomComponentStateValue(
    workflowPendingFlowKeysComponentState,
  );

  const { savePendingWorkflowFlow } = useSavePendingWorkflowFlow();

  const debouncedSavePendingWorkflowFlow = useDebouncedCallback(
    savePendingWorkflowFlow,
    WORKFLOW_FLOW_SAVE_DEBOUNCE_IN_MS,
  );

  useEffect(() => {
    if (workflowPendingFlowKeys.length > 0) {
      debouncedSavePendingWorkflowFlow();
    }
  }, [workflowPendingFlowKeys, debouncedSavePendingWorkflowFlow]);

  useEffect(() => {
    const flushPendingWorkflowFlow = () => {
      debouncedSavePendingWorkflowFlow.flush();
    };

    window.addEventListener('beforeunload', flushPendingWorkflowFlow);

    return () => {
      window.removeEventListener('beforeunload', flushPendingWorkflowFlow);
      flushPendingWorkflowFlow();
    };
  }, [debouncedSavePendingWorkflowFlow]);

  return null;
};
