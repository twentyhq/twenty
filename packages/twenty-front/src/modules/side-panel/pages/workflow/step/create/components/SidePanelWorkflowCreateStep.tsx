import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { SidePanelWorkflowCreateStepContent } from '@/side-panel/pages/workflow/step/create/components/SidePanelWorkflowCreateStepContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const SidePanelWorkflowCreateStep = () => {
  const workflowId = useSidePanelWorkflowIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowId,
        }),
      }}
    >
      <SidePanelWorkflowCreateStepContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
