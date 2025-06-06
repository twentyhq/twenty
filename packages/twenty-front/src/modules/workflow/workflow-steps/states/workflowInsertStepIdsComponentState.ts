import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowInsertStepIdsComponentState = createComponentStateV2<{
  parentStepId: string | undefined;
  nextStepId: string | undefined;
}>({
  key: 'workflowInsertStepIdsComponentState',
  defaultValue: { parentStepId: undefined, nextStepId: undefined },
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
