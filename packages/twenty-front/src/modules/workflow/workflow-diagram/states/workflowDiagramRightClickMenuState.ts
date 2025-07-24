import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

type WorkflowDiagramRightClickMenuState =
  | {
      x: number;
      y: number;
    }
  | undefined;

export const workflowDiagramRightClickMenuState =
  createComponentStateV2<WorkflowDiagramRightClickMenuState>({
    key: 'workflowDiagramRightClickMenuState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
