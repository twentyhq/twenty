import { createComponentState } from '@/ui/utilities/state/jotai/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowLastCreatedStepIdComponentState = createComponentState<
  string | undefined
>({
  key: 'workflowLastCreatedStepIdComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
