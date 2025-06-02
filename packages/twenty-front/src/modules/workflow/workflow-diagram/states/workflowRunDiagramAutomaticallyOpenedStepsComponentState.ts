import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowRunDiagramAutomaticallyOpenedStepsComponentState =
  createComponentStateV2<string[]>({
    key: 'workflowRunDiagramAutomaticallyOpenedStepsComponentState',
    defaultValue: [],
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
