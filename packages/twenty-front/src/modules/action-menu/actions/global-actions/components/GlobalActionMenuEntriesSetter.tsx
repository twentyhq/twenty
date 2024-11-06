import { WorkflowRunActionEffect } from '@/action-menu/actions/global-actions/workflow-run-actions/components/WorkflowRunActionEffect';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const GlobalActionMenuEntriesSetter = () => {
  const isWorkflowEnabled = useIsFeatureEnabled('IS_WORKFLOW_ENABLED');

  return <>{isWorkflowEnabled && <WorkflowRunActionEffect />}</>;
};
