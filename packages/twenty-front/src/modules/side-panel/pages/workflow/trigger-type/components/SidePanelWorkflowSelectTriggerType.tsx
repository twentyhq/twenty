import { SidePanelWorkflowVisualizerScope } from '@/side-panel/pages/workflow/components/SidePanelWorkflowVisualizerScope';
import { SidePanelWorkflowSelectTriggerTypeContent } from '@/side-panel/pages/workflow/trigger-type/components/SidePanelWorkflowSelectTriggerTypeContent';

export const SidePanelWorkflowSelectTriggerType = () => {
  return (
    <SidePanelWorkflowVisualizerScope>
      <SidePanelWorkflowSelectTriggerTypeContent />
    </SidePanelWorkflowVisualizerScope>
  );
};
