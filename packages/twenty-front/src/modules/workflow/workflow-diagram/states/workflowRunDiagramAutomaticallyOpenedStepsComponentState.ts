import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowRunDiagramAutomaticallyOpenedStepsComponentState =
  createComponentState<{ stepId: string; isInRightDrawer: boolean }[]>({
    key: 'workflowRunDiagramAutomaticallyOpenedStepsComponentState',
    defaultValue: [],
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
