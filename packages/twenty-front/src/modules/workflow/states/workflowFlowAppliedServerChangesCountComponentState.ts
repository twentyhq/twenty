import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowFlowAppliedServerChangesCountComponentState =
  createAtomComponentState<number>({
    key: 'workflowFlowAppliedServerChangesCountComponentState',
    defaultValue: 0,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
