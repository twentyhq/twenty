import { WorkflowDiagram } from '@/workflow/types/Workflow';
import { createState } from 'twenty-ui';

export const currentWorkflowDataState = createState<
  WorkflowDiagram | undefined
>({
  key: 'currentWorkflowDataState',
  defaultValue: undefined,
});
