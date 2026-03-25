import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { SidePanelWorkflowEditStepTypeContent } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStepTypeContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const SidePanelWorkflowEditStepType = () => {
  const workflowId = useSidePanelWorkflowIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowId,
        }),
      }}
    >
      <SidePanelWorkflowEditStepTypeContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
