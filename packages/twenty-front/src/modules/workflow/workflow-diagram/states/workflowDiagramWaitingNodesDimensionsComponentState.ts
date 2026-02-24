import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowDiagramWaitingNodesDimensionsComponentState =
  createComponentState<boolean>({
    key: 'workflowDiagramWaitingNodesDimensionsComponentState',
    defaultValue: false,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
