import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import {
  type WorkflowAction,
  type WorkflowTrigger,
} from '@/workflow/types/Workflow';
import { WorkflowVisualizerComponentInstanceContext } from '@/workflow/workflow-diagram/states/contexts/WorkflowVisualizerComponentInstanceContext';

export const flowComponentState = createAtomComponentState<
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
