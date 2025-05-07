import { createComponentStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentStateV2';
import { WorkflowAction, WorkflowTrigger } from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const flowComponentState = createComponentStateV2<
  | {
      workflowVersionId: string;
      trigger: WorkflowTrigger | null;
      steps: WorkflowAction[] | null;
    }
  | undefined
>({
  key: 'flowComponentState',
  defaultValue: undefined,
  componentInstanceContext: WorkflowVisualizerComponentInstanceContext,
});
