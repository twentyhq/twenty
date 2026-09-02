import { SidePanelWorkflowVisualizerScope } from '@/side-panel/pages/workflow/components/SidePanelWorkflowVisualizerScope';
import { SidePanelWorkflowRunViewStepContent } from '@/side-panel/pages/workflow/step/view-run/components/SidePanelWorkflowRunViewStepContent';

export const SidePanelWorkflowRunViewStep = () => {
  return (
    <SidePanelWorkflowVisualizerScope>
      <SidePanelWorkflowRunViewStepContent />
    </SidePanelWorkflowVisualizerScope>
  );
};
