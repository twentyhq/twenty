import { SidePanelWorkflowVisualizerScope } from '@/side-panel/pages/workflow/components/SidePanelWorkflowVisualizerScope';
import { SidePanelWorkflowEditStepContent } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStepContent';

export const SidePanelWorkflowEditStep = () => {
  return (
    <SidePanelWorkflowVisualizerScope>
      <SidePanelWorkflowEditStepContent />
    </SidePanelWorkflowVisualizerScope>
  );
};
