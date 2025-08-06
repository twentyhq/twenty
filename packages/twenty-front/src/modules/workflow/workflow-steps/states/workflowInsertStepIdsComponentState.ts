import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

type WorkflowInsertStepIdsState = {
  parentStepId: string | undefined;
  nextStepId: string | undefined;
  position?: { x: number; y: number };
};

export const workflowInsertStepIdsComponentState =
  createComponentState<WorkflowInsertStepIdsState>({
    key: 'workflowInsertStepIdsComponentState',
    defaultValue: {
      parentStepId: undefined,
      nextStepId: undefined,
      position: undefined,
    },
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
