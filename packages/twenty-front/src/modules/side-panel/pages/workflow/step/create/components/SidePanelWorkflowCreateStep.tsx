import { SidePanelWorkflowVisualizerScope } from '@/side-panel/pages/workflow/components/SidePanelWorkflowVisualizerScope';
import { SidePanelWorkflowCreateStepContent } from '@/side-panel/pages/workflow/step/create/components/SidePanelWorkflowCreateStepContent';

export const SidePanelWorkflowCreateStep = () => {
  return (
    <SidePanelWorkflowVisualizerScope>
      <SidePanelWorkflowCreateStepContent />
    </SidePanelWorkflowVisualizerScope>
  );
};
