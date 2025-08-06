import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowDiagramPanOnDragComponentState =
  createComponentState<boolean>({
    key: 'workflowDiagramPanOnDragComponentState',
    defaultValue: true,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
