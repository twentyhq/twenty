import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowRunDiagramAutomaticallyOpenedStepsComponentState =
  createComponentState<string[]>({
    key: 'workflowRunDiagramAutomaticallyOpenedStepsComponentState',
    defaultValue: [],
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
