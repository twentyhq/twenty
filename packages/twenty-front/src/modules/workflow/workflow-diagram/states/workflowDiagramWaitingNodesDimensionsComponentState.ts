import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowDiagramWaitingNodesDimensionsComponentState =
  createAtomComponentState<boolean>({
    key: 'workflowDiagramWaitingNodesDimensionsComponentState',
    defaultValue: false,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
