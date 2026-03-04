import { useSidePanelWorkflowIdOrThrow } from '@/command-menu/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { SidePanelWorkflowEditStepContent } from '@/command-menu/pages/workflow/step/edit/components/SidePanelWorkflowEditStepContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const CommandMenuWorkflowEditStep = () => {
  const workflowId = useSidePanelWorkflowIdOrThrow();
  const instanceId = getWorkflowVisualizerComponentInstanceId({
    recordId: workflowId,
  });

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId,
      }}
    >
      <SidePanelWorkflowEditStepContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
