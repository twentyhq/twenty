import { WorkflowAction, WorkflowTrigger } from '@/workflow/types/Workflow';
import { createState } from "twenty-ui";

export const flowState = createState<
  | {
      workflowVersionId: string;
      trigger: WorkflowTrigger | null;
      steps: WorkflowAction[] | null;
    }
  | undefined
>({
  key: 'flowState',
  defaultValue: undefined,
});
