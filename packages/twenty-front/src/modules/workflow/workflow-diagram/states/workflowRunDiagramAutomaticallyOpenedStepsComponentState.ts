import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowRunDiagramAutomaticallyOpenedStepsComponentState =
  createComponentStateV2<{ stepId: string; isInRightDrawer: boolean }[]>({
    key: 'workflowRunDiagramAutomaticallyOpenedStepsComponentState',
    defaultValue: [],
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
