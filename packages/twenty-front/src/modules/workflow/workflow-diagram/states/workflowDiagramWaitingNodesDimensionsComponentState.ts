import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowDiagramWaitingNodesDimensionsComponentState =
  createComponentStateV2<boolean>({
    key: 'workflowDiagramWaitingNodesDimensionsComponentState',
    defaultValue: false,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
