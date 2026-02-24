import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowDiagramPanOnDragComponentState =
  createComponentStateV2<boolean>({
    key: 'workflowDiagramPanOnDragComponentState',
    defaultValue: true,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
