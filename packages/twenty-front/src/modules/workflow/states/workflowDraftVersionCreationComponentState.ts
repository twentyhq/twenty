import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const workflowDraftVersionCreationComponentState =
  createAtomComponentState<Promise<string | undefined> | undefined>({
    key: 'workflowDraftVersionCreationComponentState',
    defaultValue: undefined,
    componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
  });
