import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';
import { WorkflowRunDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';

export const workflowRunStepToOpenByDefaultComponentState =
  createComponentState<
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
