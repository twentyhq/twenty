import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowFlowSaveInProgressComponentState =
  createAtomComponentState<
    { flowKeys: string[]; promise: Promise<void> } | undefined
  >({
    key: 'workflowFlowSaveInProgressComponentState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
