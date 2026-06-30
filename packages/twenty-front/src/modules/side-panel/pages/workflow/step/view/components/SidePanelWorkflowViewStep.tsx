import { useSidePanelWorkflowVersionIdOrThrow } from '@/side-panel/pages/workflow/step/view/hooks/useSidePanelWorkflowVersionIdOrThrow';
import { SidePanelWorkflowViewStepContent } from '@/side-panel/pages/workflow/step/view/components/SidePanelWorkflowViewStepContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const SidePanelWorkflowViewStep = () => {
  const workflowVersionId = useSidePanelWorkflowVersionIdOrThrow();

  return (
    <WorkflowVisualizerComponentInstanceContext.Provider
      value={{
        instanceId: getWorkflowVisualizerComponentInstanceId({
          recordId: workflowVersionId,
        }),
      }}
    >
      <SidePanelWorkflowViewStepContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
