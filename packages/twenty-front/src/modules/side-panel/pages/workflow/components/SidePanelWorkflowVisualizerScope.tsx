import { useSidePanelWorkflowVisualizerComponentInstanceIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowVisualizerComponentInstanceIdOrThrow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { type ReactNode } from 'react';

export const SidePanelWorkflowVisualizerScope = ({
  children,
}: {
  children: ReactNode;
}) => {
  const workflowVisualizerComponentInstanceId =
    useSidePanelWorkflowVisualizerComponentInstanceIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: workflowVisualizerComponentInstanceId,
        shouldScopeToWorkspaceSurface: false,
      }}
    >
      {children}
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
