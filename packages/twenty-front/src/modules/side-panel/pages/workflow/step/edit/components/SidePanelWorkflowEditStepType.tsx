import { SidePanelWorkflowVisualizerScope } from '@/side-panel/pages/workflow/components/SidePanelWorkflowVisualizerScope';
import { SidePanelWorkflowEditStepTypeContent } from '@/side-panel/pages/workflow/step/edit/components/SidePanelWorkflowEditStepTypeContent';

export const SidePanelWorkflowEditStepType = () => {
  return (
    <SidePanelWorkflowVisualizerScope>
      <SidePanelWorkflowEditStepTypeContent />
    </SidePanelWorkflowVisualizerScope>
  );
};
