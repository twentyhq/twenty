import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

type WorkflowInsertStepIdsState = {
  parentStepId: string | undefined;
  nextStepId: string | undefined;
};

export const workflowInsertStepIdsComponentState =
  createComponentStateV2<WorkflowInsertStepIdsState>({
    key: 'workflowInsertStepIdsComponentState',
    defaultValue: { parentStepId: undefined, nextStepId: undefined },
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
