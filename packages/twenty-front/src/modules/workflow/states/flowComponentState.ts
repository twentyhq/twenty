import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const flowComponentState = createComponentState<
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
