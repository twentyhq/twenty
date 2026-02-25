import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowRunDiagramAutomaticallyOpenedStepsComponentState =
  createAtomComponentState<{ stepId: string; isInRightDrawer: boolean }[]>({
    key: 'workflowRunDiagramAutomaticallyOpenedStepsComponentState',
    defaultValue: [],
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
