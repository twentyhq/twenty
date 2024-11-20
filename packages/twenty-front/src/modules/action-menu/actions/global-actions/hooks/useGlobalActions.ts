import { useWorkflowRunActions } from '@/action-menu/actions/global-actions/workflow-run-actions/hooks/useWorkflowRunActions';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const useGlobalActions = () => {
  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  const { addWorkflowRunActions, removeWorkflowRunActions } =
    useWorkflowRunActions();

  const registerGlobalActions = () => {
    if (isWorkflowEnabled) {
      addWorkflowRunActions();
    }
  };

  const unregisterGlobalActions = () => {
    if (isWorkflowEnabled) {
      removeWorkflowRunActions();
    }
  };

  return { registerGlobalActions, unregisterGlobalActions };
};
