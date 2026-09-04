import { useSidePanelWorkflowIdOrThrow } from '@/side-panel/pages/workflow/hooks/useSidePanelWorkflowIdOrThrow';
import { SidePanelWorkflowStepSettingsContent } from '@/side-panel/pages/workflow/step/settings/components/SidePanelWorkflowStepSettingsContent';
import { getWorkflowVisualizerComponentInstanceId } from '@/workflow/utils/getWorkflowVisualizerComponentInstanceId';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const SidePanelWorkflowStepSettings = () => {
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
      <SidePanelWorkflowStepSettingsContent />
    </WorkflowVisualizerComponentInstanceContext.Provider>
  );
};
