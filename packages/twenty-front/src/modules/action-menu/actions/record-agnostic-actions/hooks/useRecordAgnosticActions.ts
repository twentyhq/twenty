import { useWorkflowRunActions } from '@/action-menu/actions/record-agnostic-actions/workflow-run-actions/hooks/useWorkflowRunActions';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useRecordAgnosticActions = () => {
  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  const { addWorkflowRunActions, removeWorkflowRunActions } =
    useWorkflowRunActions();

  const registerRecordAgnosticActions = () => {
    if (isWorkflowEnabled) {
      addWorkflowRunActions();
    }
  };

  const unregisterRecordAgnosticActions = () => {
    if (isWorkflowEnabled) {
      removeWorkflowRunActions();
    }
  };

  return { registerRecordAgnosticActions, unregisterRecordAgnosticActions };
};
