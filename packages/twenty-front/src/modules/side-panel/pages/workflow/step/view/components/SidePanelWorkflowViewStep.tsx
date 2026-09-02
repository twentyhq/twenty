import { SidePanelWorkflowVisualizerScope } from '@/side-panel/pages/workflow/components/SidePanelWorkflowVisualizerScope';
import { SidePanelWorkflowViewStepContent } from '@/side-panel/pages/workflow/step/view/components/SidePanelWorkflowViewStepContent';

export const SidePanelWorkflowViewStep = () => {
  return (
    <SidePanelWorkflowVisualizerScope>
      <SidePanelWorkflowViewStepContent />
    </SidePanelWorkflowVisualizerScope>
  );
};
