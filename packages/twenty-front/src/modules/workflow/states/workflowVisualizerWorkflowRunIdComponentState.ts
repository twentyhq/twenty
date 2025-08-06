import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowVisualizerWorkflowRunIdComponentState =
  createComponentState<string | undefined>({
    key: 'workflowVisualizerWorkflowRunIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
