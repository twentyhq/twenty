import { WorkflowRunDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { createState } from 'twenty-ui/utilities';

export const workflowRunStepToOpenByDefaultState = createState<
  | {
      id: string;
      data: WorkflowRunDiagramStepNodeData;
    }
  | undefined
>({
  key: 'workflowStepIdToOpenByDefaultState',
  defaultValue: undefined,
});
