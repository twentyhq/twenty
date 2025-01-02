import { useWorkflowRunActions } from '@/action-menu/actions/record-agnostic-actions/workflow-run-actions/hooks/useWorkflowRunActions';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated/graphql';

export const useRecordAgnosticActions = () => {
  const isWorkflowEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IsWorkflowEnabled,
  );

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
