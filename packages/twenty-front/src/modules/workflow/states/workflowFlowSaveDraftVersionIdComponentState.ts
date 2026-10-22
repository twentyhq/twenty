import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowFlowSaveDraftVersionIdComponentState =
  createAtomComponentState<string | undefined>({
    key: 'workflowFlowSaveDraftVersionIdComponentState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
