import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useSaveUnsavedWorkflowFlow } from '@/workflow/hooks/useSaveUnsavedWorkflowFlow';
import { workflowUnsavedFlowKeysComponentState } from '@/workflow/states/workflowUnsavedFlowKeysComponentState';
import { useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

const WORKFLOW_FLOW_SAVE_DEBOUNCE_IN_MS = 500;

export const WorkflowFlowSaveEffect = () => {
  const workflowUnsavedFlowKeys = useAtomComponentStateValue(
    workflowUnsavedFlowKeysComponentState,
  );

  const { saveUnsavedWorkflowFlow } = useSaveUnsavedWorkflowFlow();

  const debouncedSaveUnsavedWorkflowFlow = useDebouncedCallback(
    saveUnsavedWorkflowFlow,
    WORKFLOW_FLOW_SAVE_DEBOUNCE_IN_MS,
  );

  useEffect(() => {
    if (workflowUnsavedFlowKeys.length > 0) {
      debouncedSaveUnsavedWorkflowFlow();
    }
  }, [workflowUnsavedFlowKeys, debouncedSaveUnsavedWorkflowFlow]);

  useEffect(() => {
    const flushUnsavedWorkflowFlow = () => {
      debouncedSaveUnsavedWorkflowFlow.flush();
    };

    window.addEventListener('beforeunload', flushUnsavedWorkflowFlow);

    return () => {
      window.removeEventListener('beforeunload', flushUnsavedWorkflowFlow);
      flushUnsavedWorkflowFlow();
    };
  }, [debouncedSaveUnsavedWorkflowFlow]);

  return null;
};
