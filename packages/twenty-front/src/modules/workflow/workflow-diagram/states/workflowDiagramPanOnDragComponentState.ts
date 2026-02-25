import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowDiagramPanOnDragComponentState =
  createAtomComponentState<boolean>({
    key: 'workflowDiagramPanOnDragComponentState',
    defaultValue: true,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
