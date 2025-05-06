import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { WorkflowRunDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const workflowRunStepToOpenByDefaultComponentState =
  createComponentStateV2<
    | {
        id: string;
        data: WorkflowRunDiagramStepNodeData;
      }
    | undefined
  >({
    key: 'workflowRunStepToOpenByDefaultComponentState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
