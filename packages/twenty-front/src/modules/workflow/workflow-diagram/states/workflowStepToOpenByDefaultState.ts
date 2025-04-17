import { WorkflowDiagramStepNodeData } from '@/workflow/workflow-diagram/types/WorkflowDiagram';
import { createState } from 'twenty-ui/utilities';

export const workflowStepToOpenByDefaultState = createState<
  | {
      id: string;
      data: WorkflowDiagramStepNodeData;
    }
  | undefined
>({
  key: 'workflowStepIdToOpenByDefaultState',
  defaultValue: undefined,
});
