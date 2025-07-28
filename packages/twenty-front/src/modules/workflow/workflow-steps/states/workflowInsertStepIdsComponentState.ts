import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

type WorkflowInsertStepIdsState = {
  parentStepId: string | undefined;
  nextStepId: string | undefined;
  position?: { x: number; y: number } | undefined;
};

export const workflowInsertStepIdsComponentState =
  createComponentStateV2<WorkflowInsertStepIdsState>({
    key: 'workflowInsertStepIdsComponentState',
    defaultValue: {
      parentStepId: undefined,
      nextStepId: undefined,
      position: undefined,
    },
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
